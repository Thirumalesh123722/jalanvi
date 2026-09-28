/**
 * Aqua Intellect & Marine AI - Unified Frontend API Client
 * Connects frontend directly to the FastAPI backend (with intelligent fallback).
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic request helper with timeout, token injection, and JSON parsing
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const controller = new AbortController();
  const timeout = options.timeout || 15000;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Automatically attach JWT token if present in localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('marine_ai_token') : null;
  const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export const MarineApi = {
  /**
   * 🔐 Authentication & User Profile API
   */
  async login({ email, password }) {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(registrationData) {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  },

  async getMe() {
    return await request('/auth/me', { method: 'GET' });
  },

  async updateProfile(profileData) {
    return await request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('marine_ai_token');
    }
    return { success: true };
  },

  async forgotPassword({ email }) {
    return await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword({ token, new_password, confirm_password }) {
    return await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password, confirm_password }),
    });
  },

  /**
   * Health check for backend services
   */
  async checkHealth() {
    try {
      const res = await fetch('/health');
      if (res.ok) return await res.json();
      return { status: 'offline' };
    } catch {
      return { status: 'offline' };
    }
  },

  /**
   * Run 16-agent execution pipeline
   */
  async queryAgents({ message, latitude, longitude, forecast_days = 1 }) {
    return await request('/agent/query', {
      method: 'POST',
      body: JSON.stringify({ message, latitude, longitude, forecast_days }),
      timeout: 25000,
    });
  },

  /**
   * Get operational roster of all 16 connected agents
   */
  async getAgentRoster() {
    return await request('/agent/roster', { method: 'GET' });
  },

  /**
   * Run AI Challenger red-team stress test
   */
  async challengePlan({ query, plan_name, wind_speed, wave_height }) {
    return await request('/agent/challenge', {
      method: 'POST',
      body: JSON.stringify({ query, plan_name, wind_speed, wave_height }),
    });
  },

  /**
   * Run AI Marine Scientist multi-hypothesis evaluation
   */
  async analyzeHypothesis({ query, region }) {
    return await request('/agent/scientist', {
      method: 'POST',
      body: JSON.stringify({ query, region }),
    });
  },

  /**
   * Get live ocean and weather conditions for given coordinates
   */
  async getCurrentMarineData(lat = 17.6868, lon = 83.2185) {
    return await request(`/marine/current?latitude=${lat}&longitude=${lon}`, { method: 'GET' });
  },

  /**
   * Get evaluated Potential Fishing Zones
   */
  async getPfzZones() {
    return await request('/marine/zones', { method: 'GET' });
  },

  /**
   * Get official INCOIS Ocean State Bulletin
   */
  async getIncoisBulletin() {
    return await request('/marine/bulletin', { method: 'GET' });
  },

  /**
   * Process voice audio/transcript with multilingual intent & synthesis
   */
  async processVoiceQuery({ transcript, language = 'auto', latitude, longitude, context_screen = 'GENERAL' }) {
    return await request('/voice/process', {
      method: 'POST',
      body: JSON.stringify({ transcript, language, latitude, longitude, context_screen }),
      timeout: 25000,
    });
  },

  /**
   * Run Digital Twin hydrodynamic and fuel simulation
   */
  async simulateMission(params = {}) {
    return await request('/mission/simulate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * Retrieve offline mission package bundle
   */
  async getOfflinePack(sector = 'Visakhapatnam & Bay of Bengal') {
    return await request(`/mission/offline-pack?sector=${encodeURIComponent(sector)}`, { method: 'GET' });
  },

  /**
   * 🔬 Scientific AI Reasoning & Multi-Source Evidence API
   */
  async getScientificLiveAdvisory() {
    return await request('/scientific/live-advisory', { method: 'GET' });
  },

  async analyzeScientificQuery({ query, latitude = 9.287, longitude = 79.312, context = {} }) {
    return await request('/scientific/analyze', {
      method: 'POST',
      body: JSON.stringify({ query, latitude, longitude, context }),
      timeout: 25000,
    });
  },

  async simulateScientificWhatIf({ wind_speed_knots = 18.0, wave_height_m = 1.6, distance_km = 45.0, current_speed_ms = 0.6 }) {
    return await request('/scientific/what-if', {
      method: 'POST',
      body: JSON.stringify({ wind_speed_knots, wave_height_m, distance_km, current_speed_ms }),
      timeout: 20000,
    });
  },

  /**
   * 👨‍👩‍👧 Family Link - Shore Watchdog & Safety Notification API
   */
  async getFamilyLinkStatus() {
    return await request('/family-link/status', { method: 'GET' });
  },

  async getFamilyLinkContacts() {
    return await request('/family-link/contacts', { method: 'GET' });
  },

  async createFamilyLinkContact(contactData) {
    return await request('/family-link/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },

  async updateFamilyLinkContact(contactId, contactData) {
    return await request(`/family-link/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  },

  async deleteFamilyLinkContact(contactId) {
    return await request(`/family-link/contacts/${contactId}`, {
      method: 'DELETE',
    });
  },

  async toggleFamilyLinkContactUpdates(contactId) {
    return await request(`/family-link/contacts/${contactId}/toggle-updates`, {
      method: 'PATCH',
    });
  },

  async sendFamilyLinkUpdate({ update_type = 'MISSION_UPDATE', location = null, message = '', telemetry = {} }) {
    return await request('/family-link/update', {
      method: 'POST',
      body: JSON.stringify({ update_type, location, message, telemetry }),
    });
  },

  async triggerFamilyLinkSos({ reason = 'MAN_OVERBOARD', location = null, contacts = null, direct_call_mrcc = true }) {
    return await request('/family-link/sos', {
      method: 'POST',
      body: JSON.stringify({ reason, location, contacts, direct_call_mrcc }),
    });
  },

  async cancelFamilyLinkSos({ reason = 'STAND_DOWN' }) {
    return await request('/family-link/cancel-sos', {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async getFamilyLinkTrack(token = 'DEMO_MISSION_ALPHA_2026') {
    return await request(`/family-link/track/${token}`, { method: 'GET' });
  },

  /**
   * 🧠 Personal Marine Memory & Fisher Learning
   */
  async getMarineMemoryProfile() {
    return await request('/memory/profile', { method: 'GET' });
  },

  async logFisherOutcome(outcomeData) {
    return await request('/memory/outcome', {
      method: 'POST',
      body: JSON.stringify(outcomeData),
    });
  },

  /**
   * 📜 User Application History & Activity API
   */
  async getMyActivity() {
    return await request('/history/me', { method: 'GET' });
  },

  async getUserMissions() {
    return await request('/history/missions', { method: 'GET' });
  },

  async saveUserMission(missionData) {
    return await request('/history/missions', {
      method: 'POST',
      body: JSON.stringify(missionData),
    });
  },

  async getUserScientificHistory() {
    return await request('/history/scientific', { method: 'GET' });
  },

  async saveUserScientificQuery(queryData) {
    return await request('/history/scientific', {
      method: 'POST',
      body: JSON.stringify(queryData),
    });
  },

  async getUserConversations(sessionId = null) {
    const q = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : '';
    return await request(`/history/conversations${q}`, { method: 'GET' });
  },

  async saveUserConversationMessage(msgData) {
    return await request('/history/conversations', {
      method: 'POST',
      body: JSON.stringify(msgData),
    });
  },

  async getUserSafetyEvents() {
    return await request('/history/safety-events', { method: 'GET' });
  },

  /**
   * 💬 ChatGPT-Style Conversations & Threads API
   */
  async getConversations() {
    return await request('/conversations', { method: 'GET' });
  },

  async createConversation(data = {}) {
    return await request('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getConversation(id) {
    return await request(`/conversations/${encodeURIComponent(id)}`, { method: 'GET' });
  },

  async sendMessageToConversation(id, messageData) {
    return await request(`/conversations/${encodeURIComponent(id)}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
      timeout: 30000,
    });
  },

  async updateConversationTitle(id, title) {
    return await request(`/conversations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  },

  async deleteConversation(id) {
    return await request(`/conversations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  /**
   * 🛡️ Maritime Authorities Command Center API
   */
  async getAuthorityOverview() {
    return await request('/authority/overview', { method: 'GET' });
  },

  async getAuthorityHazards() {
    return await request('/authority/hazards', { method: 'GET' });
  },

  async getHazardTracks(hazardId) {
    return await request(`/authority/hazards/${encodeURIComponent(hazardId)}/tracks`, { method: 'GET' });
  },

  async getAuthorityRiskAnalysis() {
    return await request('/authority/risk-analysis', { method: 'GET' });
  },

  async getAuthorityZones() {
    return await request('/authority/zones', { method: 'GET' });
  },

  async getAuthoritySafeZones() {
    return await request('/authority/safe-zones', { method: 'GET' });
  },

  async getAuthorityVessels(category = null) {
    const q = category ? `?category=${encodeURIComponent(category)}` : '';
    return await request(`/authority/vessels${q}`, { method: 'GET' });
  },

  async updateAuthorityVesselStatus(vesselId, category, riskScore) {
    return await request(`/authority/vessels/${encodeURIComponent(vesselId)}/status`, {
      method: 'POST',
      body: JSON.stringify({ category, risk_score: riskScore }),
    });
  },

  async getAuthorityRescueResources() {
    return await request('/authority/rescue-resources', { method: 'GET' });
  },

  async getAuthorityAlerts() {
    return await request('/authority/alerts', { method: 'GET' });
  },

  async createAuthorityAlert(alertData) {
    return await request('/authority/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  },

  async getAuthorityRecommendations() {
    return await request('/authority/recommendations', { method: 'GET' });
  },

  async approveAuthorityRecommendation(recId, notes = '') {
    return await request(`/authority/recommendations/${encodeURIComponent(recId)}/approve`, {
      method: 'POST',
      body: JSON.stringify({ officer_notes: notes }),
    });
  },

  async runAuthorityPipeline(trigger = 'MANUAL_DASHBOARD') {
    return await request(`/authority/pipeline/run?trigger=${encodeURIComponent(trigger)}`, {
      method: 'POST',
    });
  },

  async getAuthorityHistoryAnalogs() {
    return await request('/authority/history-analogs', { method: 'GET' });
  },

  async queryAuthorityMarineAi(query, language = 'en') {
    return await request('/authority/query', {
      method: 'POST',
      body: JSON.stringify({ query, language }),
      timeout: 25000,
    });
  }
};

export default MarineApi;
