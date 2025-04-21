export const useMerchantStore = defineStore('merchant', {
  actions: {
    async fetchMerchants({ page = 1, pageSize = 10, search = '', status = '' }) {
      try {
        const response = await axios.get('/api/admin/merchants', {
          params: {
            page,
            pageSize,
            username: search,
            status
          }
        });
      } catch (error) {
      }
    }
  }
}); 