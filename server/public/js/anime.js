// anime.js
import { clearCreateForm, clearEditForm } from './util.js';

let allAnime = [];
let currentPage = 1;
const itemsPerPage = 30;
let selectedAnimeId = null;
let currentSortKey = null;
let sortAscending = true;
let searchTerm = '';

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

document.querySelectorAll('#anime-table thead th[data-key]').forEach(th => {
  th.style.cursor = 'pointer';
  th.addEventListener('click', () => {
    const key = th.dataset.key;
    if (currentSortKey === key) {
      sortAscending = !sortAscending; // Toggle sort direction
    } else {
      currentSortKey = key;
      sortAscending = true;
    }
    sortAnime();
    renderAnimeTable();
  });
});

function sortAnime() {
  if (!currentSortKey) return;

  allAnime.sort((a, b) => {
    const valA = a[currentSortKey] ?? '';
    const valB = b[currentSortKey] ?? '';

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAscending ? valA - valB : valB - valA;
    }

    return sortAscending
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });
}

document.getElementById('anime-search').addEventListener('input', (e) => {
  searchTerm = e.target.value.toLowerCase();
  currentPage = 1;
  renderAnimeTable();
});

function renderAnimeTable() {
  const tableBody = document.querySelector('#anime-table tbody');
  tableBody.innerHTML = '';

  let filteredAnime = allAnime.filter(a =>
    {return a.title?.toLowerCase().includes(searchTerm)}
  );

  const maxPage = Math.ceil(filteredAnime.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = filteredAnime.slice(start, end);

  for (const anime of pageItems) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${anime.id}</td>
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

  document.getElementById('anime-page').textContent = `Page ${currentPage} of ${maxPage}`;
}

// Pagination
document.getElementById('anime-first').addEventListener('click', () => {
  currentPage = 1;
  renderAnimeTable();
});

document.getElementById('anime-last').addEventListener('click', () => {
  currentPage = Math.ceil(allAnime.length / itemsPerPage);
  renderAnimeTable();
});

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

document.getElementById('anime-go-btn').addEventListener('click', () => {
  const input = document.getElementById('anime-page-input');
  const page = parseInt(input.value, 10);
  const maxPage = Math.ceil(allAnime.length / itemsPerPage);

  if (!isNaN(page) && page >= 1 && page <= maxPage) {
    currentPage = page;
    renderAnimeTable();
  } else {
    toastr.warning(`Please enter a valid page number (1 - ${maxPage})`);
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
    await fetchAndDisplayAnime(); // Refresher listen
    clearCreateForm();
  } catch (err) {
    console.error(err);
    toastr.error('Error creating anime');
  }
});

// Edit-knap: Udfylder felterne
document.querySelector('#anime-table').addEventListener('click', (e) => {
  if (e.target.classList.contains('edit-anime')) {
    const id = e.target.dataset.id;
    selectedAnimeId = id; // <-- gem id globalt
    const anime = allAnime.find(a => {return a.id == id});
    if (!anime) return;

    document.getElementById('anime-edit-title').value = anime.title || '';
    document.getElementById('anime-edit-genre').value = anime.genre || '';
    document.getElementById('anime-edit-opinion').value = anime.opinion || '';
    document.getElementById('anime-edit-watch-again').value = anime.watch_again || '';
    document.getElementById('anime-edit-times-watched').value = anime.times_watched || '';
    document.getElementById('anime-edit-released').value = anime.released || '';
    document.getElementById('anime-edit-sub-dub').value = anime.sub_dub || '';
  }
});

// Gem ændringer
document.getElementById('anime-edit-btn').addEventListener('click', async () => {
  const title = document.getElementById('anime-edit-title').value.trim();
  const genre = document.getElementById('anime-edit-genre').value.trim();
  const opinion = document.getElementById('anime-edit-opinion').value.trim();
  const watch_again = document.getElementById('anime-edit-watch-again').value.trim();
  const times_watched = document.getElementById('anime-edit-times-watched').value.trim();
  const released = document.getElementById('anime-edit-released').value.trim();
  const sub_dub = document.getElementById('anime-edit-sub-dub').value.trim();

  if (!title || !genre) {
    toastr.warning('title and genre are required');
    return;
  }

  const updatedAnime = {
    title,
    genre,
    opinion,
    watch_again,
    times_watched,
    released,
    sub_dub
  };

  try {
    const res = await fetch(`/anime/${selectedAnimeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedAnime)
    });

    if (!res.ok) throw new Error('Failed to update anime');

    toastr.success('Anime updated!');
    await fetchAndDisplayAnime();
    clearEditForm();
  } catch (err) {
    console.error(err);
    toastr.error('Error updating anime');
  }
});

document.getElementById('anime-clear-btn').addEventListener('click', () => {
  clearEditForm();
});

// Delete Anime
document.querySelector('#anime-table').addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-anime')) {
    const id = e.target.dataset.id;

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
