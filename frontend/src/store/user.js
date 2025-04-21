export const useUserStore = defineStore('user', {
  actions: {
    async fetchUsers({ page = 1, pageSize = 10, search = '', role = '', status = '' }) {
      try {
        const response = await axios.get('/api/admin/users', {
          params: {
            page,
            pageSize,
            username: search,
            role,
            status
          }
        });
      } catch (error) {
      }
    }
  }
}); 