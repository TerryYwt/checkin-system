export const useStoreStore = defineStore('store', {
  actions: {
    async fetchStores({ page = 1, pageSize = 10, storeName = '', merchantId = '', status = '' }) {
      try {
        const response = await axios.get('/api/admin/stores', {
          params: {
            page,
            limit: pageSize,
            name: storeName,
            status
          }
        });
      } catch (error) {
      }
    }
  }
}); 