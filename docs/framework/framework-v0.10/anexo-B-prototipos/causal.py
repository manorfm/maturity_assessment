"""Protótipo de referência da camada causal noisy-OR (05 §8). Reproduz a tabela de 05 §8.4."""
import itertools, math
from math import lgamma, exp, log
causes=['feedback-lento','aprovacao-externa','fronteira-de-times']
prior={'feedback-lento':.3,'aprovacao-externa':.3,'fronteira-de-times':.2}
# lambda[symptom][cause]
lam={'pr-espera':{'feedback-lento':.6,'aprovacao-externa':.4,'fronteira-de-times':.2},
     'aprovacao-necessaria':{'feedback-lento':.02,'aprovacao-externa':.8,'fronteira-de-times':.1},
     'conflito-mesmo-servico':{'feedback-lento':.05,'aprovacao-externa':.05,'fronteira-de-times':.7}}
leak=.05
def lbeta(a,b): return lgamma(a)+lgamma(b)-lgamma(a+b)
def bb(k,n,p,phi=10):  # beta-binomial log-lik with mean p, precision phi
    a,b=p*phi,(1-p)*phi
    return lbeta(k+a,n-k+b)-lbeta(a,b)
def lr_present(k,n,p1=.6,p0=.1): # likelihoods for symptom present/absent in unit
    return exp(bb(k,n,p1)), exp(bb(k,n,p0))
def infer(obs):
    post={c:0.0 for c in causes}; Z=0
    for state in itertools.product([0,1],repeat=len(causes)):
        cs=dict(zip(causes,state))
        w=1.0
        for c in causes: w*= prior[c] if cs[c] else 1-prior[c]
        for sym,(k,n) in obs.items():
            p=1-(1-leak)*math.prod((1-lam[sym][c]) for c in causes if cs[c])
            L1,L0=lr_present(k,n)
            w*= p*L1+(1-p)*L0
        Z+=w
        for c in causes:
            if cs[c]: post[c]+=w
    return {c:round(v/Z,2) for c,v in post.items()}
print('só PR espera 6/10:',infer({'pr-espera':(6,10)}))
print('+ aprovação 7/10:',infer({'pr-espera':(6,10),'aprovacao-necessaria':(7,10)}))
print('+ conflito 1/10:',infer({'pr-espera':(6,10),'aprovacao-necessaria':(7,10),'conflito-mesmo-servico':(1,10)}))
