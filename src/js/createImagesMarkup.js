export function createImagesMarkup(images) {
  return images
    .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads, }) =>
      `<div class="photo-card">
        <a href="${largeImageURL}">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
        <ul class="info">
          <li>
            <b>Likes</b>
            <span>${likes}</span>
          </li>
          <li>
            <b>Views</b>
            <span>${views}</span>
          </li>
          <li>
            <b>Comments</b>
            <span>${comments}</span>
          </li>
          <li>
            <b>Downloads</b>
            <span>${downloads}</span>
          </li>
        </ul>
    </div>`
    )
    .join('');
}