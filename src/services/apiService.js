class ApiService {
  constructor() {
    this.activeGetRequests = {};
  }

  async get(url, config = {}) {
    const cacheKey = url + JSON.stringify(config);
    if (this.activeGetRequests[cacheKey]) {
      return this.activeGetRequests[cacheKey];
    }

    const requestPromise = (async () => {
      try {
        const response = await fetch(url, { method: "GET", ...config });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.error || `Lỗi tải dữ liệu (Mã lỗi: ${response.status})`,
          );
        }
        return await response.json();
      } catch (error) {
        throw this.handleError(error);
      } finally {
        delete this.activeGetRequests[cacheKey];
      }
    })();

    this.activeGetRequests[cacheKey] = requestPromise;
    return requestPromise;
  }

  async post(
    url,
    data,
    isShowMessage = true,
    messageSuccess = "Thêm mới thành công!",
    config = {},
  ) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.headers || {}),
        },
        body: JSON.stringify(data),
        ...config,
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error || `Lỗi gửi dữ liệu (Mã lỗi: ${response.status})`,
        );
      }
      const result = await response.json();
      if (isShowMessage) {
        this.handleSuccess(messageSuccess);
      }
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put(url, data, messageSuccess = "Cập nhật thành công!", config = {}) {
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(config.headers || {}),
        },
        body: JSON.stringify(data),
        ...config,
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error || `Lỗi cập nhật dữ liệu (Mã lỗi: ${response.status})`,
        );
      }
      const result = await response.json();
      this.handleSuccess(messageSuccess);
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(url, messageSuccess = "Xóa thành công!", config = {}) {
    try {
      const response = await fetch(url, { method: "DELETE", ...config });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error || `Lỗi xóa dữ liệu (Mã lỗi: ${response.status})`,
        );
      }
      const result = await response.json();
      this.handleSuccess(messageSuccess);
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    alert(error.message || "Đã xảy ra lỗi hệ thống!");
    return error;
  }

  handleSuccess(message) {
    if (message) {
      alert(message);
    }
  }
}

const apiService = new ApiService();
export default apiService;
