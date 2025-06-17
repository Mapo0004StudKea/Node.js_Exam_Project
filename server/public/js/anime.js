// anime.js
let allAnime = [];
let currentPage = 1;
const itemsPerPage = 15;

export async function fetchAndDisplayAnime() {
  try {
    const response = await fetch('/anime');
    if (!response.ok) throw new Error('Failed to fetch anime');
    allAnime = await response.json();

    currentPage = 1;
    renderAnimeTable();
  } catch (err) {
    console.error('Error fetching anime:', err);
    toastr.error('Failed to load anime data');
  }
}

function renderAnimeTable() {
  const tableBody = document.querySelector('#anime-table tbody');
  tableBody.innerHTML = '';

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = allAnime.slice(start, end);

  for (const anime of pageItems) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${anime.title}</td>
      <td>${anime.genre}</td>
      <td>${anime.opinion}</td>
      <td>${anime.watch_again}</td>
      <td>${anime.times_watched}</td>
      <td>${anime.released}</td>
      <td>${anime.sub_dub}</td>
      <td>
        <button class="btn-orange btn-sm edit-anime" data-id="${anime.id}">Edit</button>
        <button class="btn-gray btn-sm delete-anime" data-id="${anime.id}">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  }

  document.getElementById('anime-page').textContent = `Page ${currentPage}`;
}

// Pagination
document.getElementById('anime-prev').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderAnimeTable();
  }
});
document.getElementById('anime-next').addEventListener('click', () => {
  const maxPage = Math.ceil(allAnime.length / itemsPerPage);
  if (currentPage < maxPage) {
    currentPage++;
    renderAnimeTable();
  }
});

// Create Anime
document.getElementById('anime-create-btn').addEventListener('click', async () => {
  const title = document.getElementById('anime-create-title').value.trim();
  const genre = document.getElementById('anime-create-genre').value.trim();
  const opinion = document.getElementById('anime-create-opinion').value.trim();
  const watch_again = document.getElementById('anime-create-watch-again').value.trim();
  const times_watched = document.getElementById('anime-create-times-watched').value.trim();
  const released = document.getElementById('anime-create-released').value.trim();
  const sub_dub = document.getElementById('anime-create-sub-dub').value.trim();

  if (!title || !genre) {
    toastr.warning('Title and genre are required');
    return;
  }

  const newAnime = {
    title,
    genre,
    opinion,
    watch_again,
    times_watched,
    released,
    sub_dub
  };

  try {
    const res = await fetch('/anime', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newAnime)
    });

    if (!res.ok) throw new Error('Failed to create anime');

    toastr.success('Anime created!');
    await fetchAndDisplayAnime(); // Refresh list
    clearCreateForm();
  } catch (err) {
    console.error(err);
    toastr.error('Error creating anime');
  }
});

function clearCreateForm() {
  document.getElementById('anime-create-title').value = '';
  document.getElementById('anime-create-genre').value = '';
  document.getElementById('anime-create-opinion').value = '';
  document.getElementById('anime-create-watch-again').value = '';
  document.getElementById('anime-create-times-watched').value = '';
  document.getElementById('anime-create-released').value = '';
  document.getElementById('anime-create-sub-dub').value = '';
}

// Delete Anime
document.querySelector('#anime-table').addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-anime')) {
    const id = e.target.dataset.id;

    if (!confirm('Are you sure you want to delete this anime?')) return;

    try {
      const res = await fetch(`/anime/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete anime');

      toastr.success('Anime deleted!');
      await fetchAndDisplayAnime(); // Refresh table
    } catch (err) {
      console.error(err);
      toastr.error('Error deleting anime');
    }
  }
});

// Upload CSV
document.getElementById('anime-upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  const fileInput = form.querySelector('input[type="file"]');
  if (!fileInput.files.length) {
    toastr.warning('Please select a CSV file to upload');
    return;
  }

  try {
    const res = await fetch('/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error('Failed to upload CSV');

    toastr.success('CSV uploaded successfully!');
    await fetchAndDisplayAnime(); // Refresh table
    form.reset();
  } catch (err) {
    console.error(err);
    toastr.error('Error uploading CSV');
  }
});

