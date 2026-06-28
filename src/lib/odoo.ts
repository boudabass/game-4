export class OdooClient {
  private url: string;
  private db: string;

  constructor() {
    this.url = process.env.ODOO_URL || "https://www.theelsassisch.com";
    this.db = process.env.ODOO_DB || "theelsassisch";
  }

  /**
   * Generic JSON-RPC call helper
   */
  async jsonRpcCall(path: string, method: string, params: any = {}, sessionId?: string) {
    const endpoint = `${this.url}${path}`;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (sessionId) {
      // Pass the session ID to the Odoo backend
      headers["Cookie"] = `session_id=${sessionId}`;
    }

    const payload = {
      jsonrpc: "2.0",
      method,
      params,
      id: Math.floor(Math.random() * 1000000000),
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Odoo API Error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Odoo RPC Error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    // Extract set-cookie for session_id if it's the authentication call
    const setCookie = response.headers.get("set-cookie");
    let newSessionId = null;
    
    if (setCookie) {
      const match = setCookie.match(/session_id=([^;]+)/);
      if (match) {
        newSessionId = match[1];
      }
    }

    return { result: data.result, sessionId: newSessionId };
  }

  /**
   * Authenticate a user with Odoo and get a session_id
   */
  async authenticate(login: string, password: string) {
    const { result, sessionId } = await this.jsonRpcCall(
      "/web/session/authenticate",
      "call",
      {
        db: this.db,
        login,
        password,
      }
    );
    
    // Result contains the user context (uid, name, etc.)
    return { user: result, sessionId };
  }

  /**
   * Call a model method via web/dataset/call_kw
   */
  async callKw(model: string, method: string, args: any[] = [], kwargs: any = {}, sessionId?: string) {
    const { result } = await this.jsonRpcCall(
      "/web/dataset/call_kw",
      "call",
      {
        model,
        method,
        args,
        kwargs,
      },
      sessionId
    );
    return result;
  }
}

// Export a singleton instance
export const odooClient = new OdooClient();
