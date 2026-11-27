(() => {
"use strict";
const root=document.querySelector("[data-career-view]");
if(!root)return;
const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const href=s=>/^https?:\/\/|^\/(?!\/)/.test(String(s))?esc(s):"#";
const title=(a,b)=>'<section class="section" id="'+a+'"><h2>'+b+'</h2>';
const indexCard=r=>'<a class="career-card" href="roles/'+esc(r.id)+'/"><span class="overline">'+esc(r.category)+'</span><h3 lang="en">'+esc(r.name)+'</h3><p class="subtitle">'+esc(r.zh)+'</p><p class="summary">'+esc(r.summary)+'</p><span class="career-cta">查看岗位路径 →</span></a>';
const skillCard=s=>'<article class="career-skill"><div class="area">'+esc(s.area)+' <span class="career-badge">'+esc(s.priority)+'</span></div><h3>'+esc(s.topic)+'</h3><p>'+esc(s.what)+'</p><a href="'+href(s.url)+'">前往对应学科 →</a></article>';
function index(roles,note){
const cards=roles.map(indexCard).join("");
const rows=roles.map(r=>'<tr><td>'+esc(r.name)+'</td><td>'+esc(r.focus)+'</td><td><a href="roles/'+esc(r.id)+'/">查看路线</a></td></tr>').join("");
root.innerHTML=title("roles","选择目标岗位")+'<p class="career-section-intro">先从岗位出发，再进入已有的学科路线。以下三类岗位分别对应研究、工程、策略与产品。</p><div class="career-roles">'+cards+'</div></section>'
+title("compare","三类岗位怎么区分")+'<div class="route"><table class="career-matrix"><thead><tr><th>岗位</th><th>主要侧重点</th><th>详情</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>'
+title("workflow","从岗位到学习的路径")+'<div class="career-step-grid"><div class="career-step"><strong>01 选择岗位</strong><p>确认主要工作内容，先分清研究、开发与策略产品。</p></div><div class="career-step"><strong>02 匹配知识</strong><p>按能力要求跳转到计算机、数学、金融、量化或英语的现有课程。</p></div><div class="career-step"><strong>03 完成证据</strong><p>通过面试练习和作品项目检验学习成果。</p></div></div></section>'
+title("subjects","已有学科")+'<p class="career-section-intro">知识体系独立维护，职业页面只引用，不复制课程。</p><nav class="career-header-note" aria-label="学科链接"><a class="career-pill" href="/learn/computer-science/">计算机科学</a><a class="career-pill" href="/learn/mathematics-statistics/">数学与统计</a><a class="career-pill" href="/learn/finance-investment/">金融与投资</a><a class="career-pill" href="/learn/quantitative-research/">量化研究与交易</a><a class="career-pill" href="/learn/english/">英语学习</a></nav><p class="career-footnote">'+esc(note)+'</p></section>';
}
function detail(role,note,date){
document.title=role.name+" · 职业路径 · Kurage";
const label=document.querySelector("[data-role-title]");if(label)label.textContent=role.name;
const desc=document.querySelector("[data-role-desc]");if(desc)desc.textContent=role.zh+" · "+role.summary;
const skills=role.skills.map(skillCard).join("");
const questions=role.questions.map(q=>'<details class="career-question"><summary><span class="career-badge">'+esc(q.category)+'</span> '+esc(q.question)+'</summary><p>'+esc(q.answer)+'</p></details>').join("");
const projects=role.projects.map(p=>'<article class="career-project"><h3>'+esc(p.title)+'</h3><p><strong>交付：</strong>'+esc(p.deliverable)+'</p><p><strong>验收：</strong>'+esc(p.acceptance)+'</p></article>').join("");
const sources=role.sources.map(s=>'<li><a target="_blank" rel="noopener noreferrer" href="'+href(s.url)+'">'+esc(s.label)+'</a></li>').join("");
const responsibilities=role.responsibilities.map(x=>'<li>'+esc(x)+'</li>').join("");
root.innerHTML=title("responsibilities","岗位工作内容")+'<div class="route"><ol class="career-detail-list">'+responsibilities+'</ol></div></section>'
+title("skills","岗位能力 → 学科知识")+'<p class="career-section-intro">直接关联现有学习路线；“核心 / 进阶”是本网站的学习建议，不代表企业硬性门槛。</p><div class="career-topic-grid">'+skills+'</div></section>'
+title("interviews","面试与笔试示例")+'<p class="career-section-intro">点开问题查看思考框架，题目为根据能力要求编写的练习，并非声称是企业原题。</p>'+questions+'</section>'
+title("projects","推荐作品项目")+'<p class="career-section-intro">用交付物证明能力，而不只在简历上列技术关键词。</p>'+projects+'</section>'
+title("references","参考岗位资料")+'<p class="career-section-intro">参考公开的企业岗位或团队说明，实际要求因地区、级别和公司而异。</p><ul class="career-links">'+sources+'</ul><p class="career-footnote">页面资料核对：'+esc(date)+'。'+esc(note)+'</p></section>';
}
fetch(root.dataset.dataUrl).then(r=>{if(!r.ok)throw new Error("数据加载失败");return r.json()}).then(d=>{
const roles=d.roles;if(!Array.isArray(roles))throw new Error("数据格式错误");
if(root.dataset.careerView==="index")index(roles,d.note);
else {const role=roles.find(x=>x.id===root.dataset.role);if(!role)throw new Error("找不到该岗位");detail(role,d.note,d.last_reviewed)}
}).catch(()=>{root.innerHTML='<div class="career-empty">岗位内容暂时无法加载。请刷新页面重试，或返回 <a href="/career/">职业中心</a>。</div>'});
})();