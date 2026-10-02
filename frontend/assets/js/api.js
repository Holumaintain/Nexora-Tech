/*==================================================
                    NEXORA API
==================================================*/

(function () {
  "use strict";

  const config = window.NEXORA_CONFIG;

  if (!config || !config.API_BASE_URL) {
    console.error("Nexora API configuration is missing.");
    return;
  }

  async function apiRequest(endpoint, options = {}) {
    const url = `${config.API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const token = localStorage.getItem("nexora_token");

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    });

    let data;

    try {
      data = await response.json();
    } catch {
      data = {
        success: false,
        message: "The server returned an invalid response.",
      };
    }

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed with status ${response.status}`,
      );
    }

    return data;
  }

  window.NexoraAPI = {
    get(endpoint, options = {}) {
      return apiRequest(endpoint, {
        ...options,
        method: "GET",
      });
    },

    post(endpoint, body, options = {}) {
      return apiRequest(endpoint, {
        ...options,
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    put(endpoint, body, options = {}) {
      return apiRequest(endpoint, {
        ...options,
        method: "PUT",
        body: JSON.stringify(body),
      });
    },

    delete(endpoint, options = {}) {
      return apiRequest(endpoint, {
        ...options,
        method: "DELETE",
      });
    },
  };
})();