document.querySelectorAll('[data-confirm]').forEach(el=>el.addEventListener('click',e=>{if(!confirm(el.dataset.confirm))e.preventDefault()}));
document.querySelectorAll('[data-minutes]').forEach(input=>input.addEventListener('input',()=>{input.value=input.value.replace(/[^0-9]/g,'');updateDiaryTotal(input.closest('[data-diary-form]'))}));
function updateDiaryTotal(form){if(!form)return;const total=[...form.querySelectorAll('[data-minutes]')].reduce((sum,input)=>sum+(Number(input.value)||0),0);const output=form.querySelector('[data-total]');if(output)output.textContent=`${Math.floor(total/60)}h ${total%60}min`;}
document.querySelectorAll('[data-diary-form]').forEach(updateDiaryTotal);

document.querySelectorAll('[data-week-unlock]').forEach(toggle => {
  toggle.addEventListener('change', () => {
    const form = document.querySelector('input[name="unlock_week"]')?.form;
    if (!form) return;
    form.querySelector('[name="unlock_week"]').value = toggle.checked ? '1' : '0';
    form.querySelectorAll('[data-lockable]').forEach(field => field.disabled = !toggle.checked);
    form.querySelectorAll('.student-rating').forEach(syncStudentRating);
    form.querySelectorAll('tr').forEach(syncAbsenceJustification);
  });
});

document.querySelectorAll('[data-addendum-unlock]').forEach(toggle => {
  toggle.addEventListener('change', () => {
    const form = toggle.closest('form');
    form.querySelector('[name="unlock_addendum"]').value = toggle.checked ? '1' : '0';
    form.querySelectorAll('[data-addendum-field]').forEach(field => field.disabled = !toggle.checked);
  });
});

document.querySelectorAll('[data-summary-open]').forEach(button => button.addEventListener('click', () => {
  document.getElementById(button.dataset.summaryOpen)?.showModal();
}));
document.querySelectorAll('[data-summary-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog')?.close()));
document.querySelectorAll('.student-summary-dialog').forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
}));

let doubtSequence = 0;
document.querySelectorAll('[data-add-doubt]').forEach(button => button.addEventListener('click', () => {
  const form = button.closest('form');
  const template = form?.querySelector('[data-doubt-template]');
  const list = form?.querySelector('[data-doubt-list]');
  if (!template || !list) return;
  const key = `new${Date.now()}_${doubtSequence++}`;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = template.innerHTML.replaceAll('__KEY__', key).trim();
  list.append(wrapper.firstElementChild);
  form.querySelector('[data-empty-doubts]')?.remove();
  list.lastElementChild?.querySelector('textarea')?.focus();
}));
document.addEventListener('click', event => {
  const button = event.target.closest('[data-remove-doubt]');
  if (!button) return;
  const form = button.closest('form');
  button.closest('.doubt-item')?.remove();
  const list = form?.querySelector('[data-doubt-list]');
  if (list && !list.children.length && !form.querySelector('[data-empty-doubts]')) {
    const empty = document.createElement('p'); empty.className = 'empty-doubts muted'; empty.dataset.emptyDoubts = ''; empty.textContent = 'Ainda não existem dúvidas.'; list.after(empty);
  }
});

document.querySelectorAll('[data-doubt-cycle]').forEach(button => button.addEventListener('click', () => {
  const controls = button.closest('.doubt-evaluation');
  const input = controls?.querySelector('input[type="hidden"]');
  if (!controls || !input || button.disabled) return;
  const next = input.value === '' ? 'certo' : (input.value === 'certo' ? 'errado' : '');
  const view = next === 'certo' ? ['✓','Verdadeiro'] : (next === 'errado' ? ['✕','Falso'] : ['?','Não respondido']);
  input.value = next; button.dataset.state = next; button.textContent = view[0]; button.title = view[1]; button.setAttribute('aria-label', view[1]);
  button.classList.remove('state-unanswered','state-certo','state-errado'); button.classList.add(`state-${next || 'unanswered'}`);
}));

document.querySelectorAll('[data-previous-task-cycle]').forEach(button => button.addEventListener('click', () => {
  const item=button.closest('.previous-task-item');const input=item?.querySelector('input[type="hidden"]');if(!input||button.disabled)return;
  const next=input.value===''?'cumprida':(input.value==='cumprida'?'nao_cumprida':'');const view=next==='cumprida'?['✓','Cumprida']:(next==='nao_cumprida'?['✕','Não cumprida']:['?','Não avaliada']);
  input.value=next;button.textContent=view[0];button.title=view[1];button.setAttribute('aria-label',view[1]);button.classList.remove('state-unanswered','state-cumprida','state-nao_cumprida');button.classList.add(`state-${next||'unanswered'}`);
}));

function syncStudentRating(control){const toggle=control.querySelector('[data-rating-toggle]');const range=control.querySelector('[data-rating-range]');const output=control.querySelector('output');if(!range||!output)return;if(toggle){range.disabled=toggle.disabled||!toggle.checked;output.textContent=toggle.checked?range.value:'—';}else output.textContent=range.value;}
document.querySelectorAll('.student-rating').forEach(control=>{const toggle=control.querySelector('[data-rating-toggle]');const range=control.querySelector('[data-rating-range]');toggle?.addEventListener('change',()=>syncStudentRating(control));range?.addEventListener('input',()=>syncStudentRating(control));syncStudentRating(control);});

function syncAbsenceJustification(row){const attendance=row.querySelector('[data-attendance-status]');const justification=row.querySelector('[data-absence-justification]');if(!attendance||!justification)return;const editable=justification.dataset.editable==='1';justification.disabled=!editable||attendance.disabled||!attendance.checked;if(!attendance.checked)justification.checked=false;}
document.querySelectorAll('[data-attendance-status]').forEach(attendance=>{attendance.addEventListener('change',()=>syncAbsenceJustification(attendance.closest('tr')));syncAbsenceJustification(attendance.closest('tr'));});

document.querySelectorAll('[data-expand-doubt]').forEach(button => button.addEventListener('click', () => {
  const row = button.closest('.meeting-doubt'); const expanded = row?.classList.toggle('expanded');
  button.textContent = expanded ? '↥' : '↕'; button.setAttribute('aria-label', expanded ? 'Recolher dúvida e resposta' : 'Expandir dúvida e resposta');
}));

let meetingTaskSequence = 0;
document.querySelectorAll('[data-add-meeting-task]').forEach(button => button.addEventListener('click', () => {
  const form=button.closest('form');const template=form?.querySelector('[data-meeting-task-template]');const list=form?.querySelector('[data-meeting-task-list]');if(!template||!list)return;
  const wrapper=document.createElement('div');wrapper.innerHTML=template.innerHTML.replaceAll('__KEY__',`new${Date.now()}_${meetingTaskSequence++}`).trim();list.append(wrapper.firstElementChild);form.querySelector('[data-empty-meeting-tasks]')?.remove();list.lastElementChild?.querySelector('select')?.focus();
}));
document.addEventListener('change', event => {
  const select=event.target.closest('[data-task-catalog]');if(!select)return;const row=select.closest('.meeting-task-item');const text=row?.querySelector('[data-task-text]');if(!text)return;
  if(select.value==='new'){text.value='';text.readOnly=false;text.placeholder='Escreva a nova frase';text.focus();}
  else if(select.value){text.value=select.selectedOptions[0]?.dataset.text||select.selectedOptions[0]?.textContent||'';text.readOnly=true;}
  else{text.value='';text.readOnly=true;text.placeholder='Escolha uma frase';}
});
document.addEventListener('click', event => {
  const button=event.target.closest('[data-remove-meeting-task]');if(!button)return;const form=button.closest('form');button.closest('.meeting-task-item')?.remove();const list=form?.querySelector('[data-meeting-task-list]');if(list&&!list.children.length&&!form.querySelector('[data-empty-meeting-tasks]')){const empty=document.createElement('p');empty.className='muted';empty.dataset.emptyMeetingTasks='';empty.textContent='Ainda não existem tarefas.';list.after(empty);}
});

document.querySelectorAll('.muted').forEach(label => {
  if (label.textContent.trim() === 'Alunos ativos') label.textContent = 'Alunos com horas registadas';
});

document.querySelectorAll('[data-question-unlock]').forEach(lock => lock.addEventListener('change', () => {
  const form=lock.closest('form');if(!form)return;
  form.querySelector('input[name="unlock_teacher"]').value=lock.checked?'1':'0';
  form.querySelectorAll('[data-question-answer]').forEach(control=>{if(control.hasAttribute('contenteditable'))control.contentEditable=lock.checked?'true':'false';else control.disabled=!lock.checked});
}));

document.querySelectorAll('form').forEach(form => {
  const action=form.querySelector('input[name="action"]')?.value;
  if(!['save_group_schedule','save_group_partner'].includes(action))return;
  const unlock=document.createElement('input');unlock.type='hidden';unlock.name='unlock_group_edit';unlock.value='0';form.append(unlock);
  const controls=[...form.querySelectorAll('select,input[type="time"],button[type="submit"],button:not([type])')];controls.forEach(control=>control.disabled=true);
  const button=document.createElement('button');button.type='button';button.className='btn small';button.textContent='🔒 Abrir para alterar';form.prepend(button);
  button.addEventListener('click',()=>{const open=unlock.value!=='1';unlock.value=open?'1':'0';controls.forEach(control=>control.disabled=!open);button.textContent=open?'🔓 Fechar cadeado':'🔒 Abrir para alterar';});
});

document.querySelectorAll('.unavailable-action').forEach(element=>element.remove());
