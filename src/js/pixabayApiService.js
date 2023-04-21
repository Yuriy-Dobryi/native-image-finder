import axios from 'axios';

export class PixabayApiService {
  constructor() {
    this.query = '';
    this.page = 1;
  }

  async getData() {
    const config = {
      params: {
        key: `35543828-6c73cc5fdea5a14873063547d`,
        q: this.query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: this.page,
        per_page: 40,
      },
    };
    const URL = `https://pixabay.com/api/`;

    const response = await axios.get(URL, config);
    this.incrementPage();
    return response.data;
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get searchQuery() {
    return this.query;
  }

  set searchQuery(newQuery) {
    this.query = newQuery;
  }
}