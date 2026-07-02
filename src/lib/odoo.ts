export class OdooClient {
  private url: string;
  private db: string;
  // Session du compte de service (interne), mise en cache entre les requetes.
  private serviceSessionId: string | null = null;

  constructor() {
    // On s'assure d'enlever le slash final s'il y en a un
    const rawUrl = process.env.ODOO_URL || "https://www.theelsassisch.com";
    this.url = rawUrl.replace(/\/$/, "");
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
    const { result, sessionId: cookieSessionId } = await this.jsonRpcCall(
      "/web/session/authenticate",
      "call",
      {
        db: this.db,
        login,
        password,
      }
    );

    const finalSessionId = result.session_id || cookieSessionId;

    if (!finalSessionId) {
      throw new Error("Impossible de récupérer l'ID de session depuis Odoo.");
    }

    return { user: result, sessionId: finalSessionId };
  }

  /**
   * Call a model method via web/dataset/call_kw
   */
  async callKw(model: string, method: string, args: any[] = [], kwargs: any = {}, sessionId?: string) {
    const { result } = await this.jsonRpcCall(
      `/web/dataset/call_kw/${model}/${method}`,
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

  /**
   * Session du COMPTE DE SERVICE (utilisateur interne dédié).
   * Utilisée pour toutes les écritures/lectures des scores et sauvegardes,
   * afin que les clients (comptes portail) n'aient jamais besoin d'un accès
   * direct aux modèles Odoo. Mise en cache et ré-authentifiée si expirée.
   */
  async getServiceSession(): Promise<string> {
    if (this.serviceSessionId) return this.serviceSessionId;

    const login = process.env.ODOO_API_LOGIN;
    const password = process.env.ODOO_API_PASSWORD;
    if (!login || !password) {
      throw new Error("Compte de service non configuré (ODOO_API_LOGIN / ODOO_API_PASSWORD manquants).");
    }

    const { sessionId } = await this.authenticate(login, password);
    this.serviceSessionId = sessionId;
    return sessionId;
  }

  /**
   * call_kw via le compte de service, avec ré-authentification unique
   * si la session a expiré.
   */
  async callKwService(model: string, method: string, args: any[] = [], kwargs: any = {}) {
    try {
      const sid = await this.getServiceSession();
      return await this.callKw(model, method, args, kwargs, sid);
    } catch (e) {
      // La session de service est peut-être expirée : on la réinitialise et on réessaie une fois.
      this.serviceSessionId = null;
      const sid = await this.getServiceSession();
      return await this.callKw(model, method, args, kwargs, sid);
    }
  }
}

// Export a singleton instance
export const odooClient = new OdooClient();
