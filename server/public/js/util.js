export function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 70%, 60%)`;
}

export function clearCreateForm() {
  document.getElementById('anime-create-title').value = '';
  document.getElementById('anime-create-genre').value = '';
  document.getElementById('anime-create-opinion').value = '';
  document.getElementById('anime-create-watch-again').value = '';
  document.getElementById('anime-create-times-watched').value = '';
  document.getElementById('anime-create-released').value = '';
  document.getElementById('anime-create-sub-dub').value = '';
}

export function clearEditForm() {
  document.getElementById('anime-edit-title').value = '';
  document.getElementById('anime-edit-genre').value = '';
  document.getElementById('anime-edit-opinion').value = '';
  document.getElementById('anime-edit-watch-again').value = '';
  document.getElementById('anime-edit-times-watched').value = '';
  document.getElementById('anime-edit-released').value = '';
  document.getElementById('anime-edit-sub-dub').value = '';
}