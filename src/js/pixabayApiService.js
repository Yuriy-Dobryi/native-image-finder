export class PixabayApiService {
  constructor() {
    this.query = '';
    this.page = 1;
  }

  fetchImages() {
    const parameters = new URLSearchParams({
      key: `35543828-6c73cc5fdea5a14873063547d`,
      q: this.query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,

      page: this.page,
      per_page: 40,
    });
    const URL = `https://pixabay.com/api/?${parameters}`;

    return fetch(URL)
      .then(response => response.json())
      .then(({ hits: images }) =>

        images.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) =>
            ({ webformatURL, largeImageURL, tags, likes, views, comments, downloads })
        )
      );
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