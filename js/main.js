const tbody = document.getElementById('activity-body');
const addBtn = document.getElementById('add-btn');
const globalUnit = document.getElementById('global-unit');
const durationHeader = document.getElementById('duration-header');

const unitLabel = { hour: '시간', day: '일', week: '주' };

globalUnit.addEventListener('change', () => {
  durationHeader.textContent = `소요 기간 (${unitLabel[globalUnit.value]})`;
});

function createRow() {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" placeholder="예) A"></td>
    <td><input type="text" placeholder="예) 설계"></td>
    <td><input type="text" placeholder="예) A, B (없으면 비워두세요)"></td>
    <td><input type="number" placeholder="예) 3" min="0"></td>
    <td><button class="delete-btn" title="삭제">✕</button></td>
  `;
  tr.querySelector('.delete-btn').addEventListener('click', () => tr.remove());
  return tr;
}

addBtn.addEventListener('click', () => {
  tbody.appendChild(createRow());
});

for (let i = 0; i < 3; i++) {
  tbody.appendChild(createRow());
}
