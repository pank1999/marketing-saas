# Setup ingress on the kubernetes cluster

Resource: https://www.digitalocean.com/community/tutorials/how-to-set-up-an-nginx-ingress-with-cert-manager-on-digitalocean-kubernetes

> Apply

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.1/deploy/static/provider/do/deploy.yaml
```

> Verify

```bash
kubectl get svc --namespace=ingress-nginx
```

## Setup Cert manager

> Apply

```bash
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.7.1/cert-manager.yaml
```

> Verify

```bash
kubectl get pods --namespace cert-manager
```
