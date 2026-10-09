"""Protótipo de referência do modelo de medição m2 (05 §3–§7). Reproduz os números de 05 §5.1 e §7.3."""
import numpy as np, itertools
S=np.arange(5)
KAPPA={'low':0.6,'medium':1.0,'high':1.6}
def p_option(chosen, anchors, s, delta, kappa):
    # multinomial logit over the options of the item, utility = -kappa*|a - (s+delta)|
    u=np.array([-kappa*abs(a-(s+delta)) for a in anchors])
    p=np.exp(u-u.max()); p/=p.sum()
    return p[anchors.index(chosen)]
def within(psi):
    # P(e | S): experienced state around unit state, heterogeneity psi
    M=np.array([[np.exp(-psi*abs(e-s)) for e in S] for s in S]); return M/M.sum(1,keepdims=True)
def respondent_lik(items, delta, psi):
    # items: list of (chosen_anchor, anchors, kappa) one per testlet
    Le=np.ones(5)
    for chosen,anchors,k in items:
        Le*=np.array([p_option(chosen,anchors,e,delta,KAPPA[k]) for e in S])
    W=within(psi)          # S x e
    return W@Le            # L_j(S)=sum_e P(e|S) L(e)
def posterior(prior, resp, psi=1.2, deltas=None):
    post=np.array(prior,float)
    for r,items in resp:
        d=(deltas or {}).get(r,0.0)
        post*=respondent_lik(items,d,psi)
    return post/post.sum()
def summary(p):
    mean=(p*S).sum(); c=np.cumsum(p)
    lo=int(np.searchsorted(c,0.05)); hi=int(np.searchsorted(c,0.95))
    return dict(dist=np.round(p,3).tolist(), index=round(mean/4*100), interval=(lo*25,hi*25))
opts=[0,1,2,3,4]
# team: 3 engineering report isolation (anchor 1), 1 eng reports 2, 2 mgmt report 3, 1 platform 1
resp=[('eng',[(1,opts,'medium'),(1,[1,2,3],'high')]),
      ('eng',[(1,opts,'medium')]),
      ('eng',[(2,opts,'medium'),(1,[1,2,3],'high')]),
      ('eng',[(1,opts,'medium')]),
      ('mgmt',[(3,opts,'medium')]),
      ('mgmt',[(3,opts,'medium')]),
      ('plat',[(1,opts,'medium')])]
prior=np.ones(5)/5
print('sem correção', summary(posterior(prior,resp)))
print('com severidade mgmt=+1', summary(posterior(prior,resp,deltas={'mgmt':1.0})))
for r in ['eng','mgmt']:
    sub=[x for x in resp if x[0]==r]
    print(r,'bruto',summary(posterior(prior,sub)),'corrigido',summary(posterior(prior,sub,deltas={'mgmt':1.0})))
# divergence probability P(|S_eng - S_mgmt|>=1)
def pdiv(pa,pb): return sum(pa[i]*pb[j] for i in S for j in S if abs(i-j)>=1)
pe=posterior(prior,[x for x in resp if x[0]=='eng']); pm=posterior(prior,[x for x in resp if x[0]=='mgmt'])
pmc=posterior(prior,[x for x in resp if x[0]=='mgmt'],deltas={'mgmt':1.0})
print('P(div>=1) bruto',round(pdiv(pe,pm),2),'corrigido',round(pdiv(pe,pmc),2))
def pdiv2(pa,pb): return sum(pa[i]*pb[j] for i in S for j in S if abs(i-j)>=2)
print('P(div>=2) bruto',round(pdiv2(pe,pm),2),'corrigido',round(pdiv2(pe,pmc),2))
# aggregation MC
rng=np.random.default_rng(1)
leaves={'ci':posterior(prior,resp,deltas={'mgmt':1.0}),
        'wm':np.array([.05,.15,.45,.3,.05]),'rel':np.array([.02,.08,.3,.45,.15]),'plan':np.array([.1,.4,.35,.1,.05])}
w={'ci':1,'wm':1,'rel':1,'plan':0.5}
draws=[]; 
for _ in range(20000):
    s={k:rng.choice(5,p=v) for k,v in leaves.items()}
    avg=sum(w[k]*s[k] for k in s)/sum(w.values()); cap=min(s.values())+1
    draws.append(min(avg,cap)/4*100)
draws=np.array(draws); print('pai: indice',round(draws.mean()),'faixa',np.round(np.percentile(draws,[5,95])))
draws2=[]
for _ in range(20000):
    s={k:rng.choice(5,p=v) for k,v in leaves.items()}
    draws2.append(min(s.values())/4*100)
print('minimo puro', round(np.mean(draws2)))
