
(function(){
const tbody=document.querySelector('#issueRows');if(!tbody)return;const arr=JSON.parse(localStorage.getItem('budadiriIssues')||'[]');
if(!arr.length){tbody.innerHTML='<tr><td colspan="5" class="small">No prototype submissions yet. Submit an issue from the Community page to test the workflow.</td></tr>';return}
tbody.innerHTML=arr.map(x=>`<tr><td><strong>${x.ref}</strong></td><td>${x.name||'—'}</td><td>${x.area||'—'}</td><td>${x.category||'—'}</td><td>${new Date(x.created).toLocaleDateString()}</td></tr>`).join('')
})();
