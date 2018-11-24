
# **Test Command Line**
- node server.js
- docker build -t gcr.io/nicejames-sandbox/hello-node:v1 .
- => 포맷 https://cloud.google.com/container-registry/docs/pushing-and-pulling
- docker run -d -p 8080:8080 gcr.io/nicejames-sandbox/hello-node:v1 
- docker exec -i -t [컨테이너 ID] /bin/bash  => (docker ps, log.out 파일이 생성되었는지 확인)
- gcloud 설치 (https://cloud.google.com/sdk/docs/downloads-interactive)
- curl https://sdk.cloud.google.com | bash
- exec -l $SHELL
- gcloud init
- gcloud components install kubectl
- gcloud container clusters get-credentials [CLUSTER_NAME]
- gcloud container clusters list
- gcloud auth configure-docker
- docker push gcr.io/nicejames-sandbox/hello-node:v1
- kubectl create -f hello-node-rc.yaml
- kubectl get pod
- kubectl describe pod hello-node-rc-dqz7s
- kubectl exec -it hello-node-rc-kbl4v -- curl 10.44.2.8:8080
- kubectl exec -it hello-node-rc-sckbd -- curl 10.44.0.6:8080
- kubectl create -f hello-node-svc.yaml
- kubectl get svc
- kubectl delete pod --all => 다시 생성됨 (RC가 제거 되기 전까지 계속 생성됨)
- kubectl scale --replicas=5 rc/hello-node-rc
- kubectl delete svc --all
- kubectl delete rc --all
- kubectl delete pod --all

## Service
- kubectl get pods --template='{{range.items}} HostIP: {{.status.hostIP}}  PodIP: {{.status.podIP}}{{end}}{{"\n"}}'
- nslookup hello-node-svc-headless
- kubectl exec -it hello-node-rc-dvc8k -- ping hello-node-svc.default.svc.cluster.local
- => PING hello-node-svc.default.svc.cluster.local (10.47.249.132) 56(84) bytes of data.
- IP를 생성하는 명령어 => gcloud compute addresses create [IP 리소스명] --region [리전]
- gcloud compute addresses create hello-node-ip-region --region asia-northeast1
- => Created [https://www.googleapis.com/compute/v1/projects/nicejames-sandbox/regions/asia-northeast1/addresses/hello-node-ip-region].



## The Ingress (API Gateway)
1. https://github.com/kubernetes/ingress-gce/blob/master/README.md
2. https://github.com/kubernetes/ingress-nginx/blob/master/README.md
3. 상용 https://clouddocs.f5.com/products/connectors/k8s-bigip-ctlr/v1.5/
4. https://konghq.com/blog/kubernetes-ingress-controller-for-kong/

- kubectl create -f hello-ingress.yaml
- kubectl get ing
- http://35.241.39.177/users/
- http://35.241.39.177/products/
- NodePort 로 설정하는 것이 중요한 사항
- products-node-svc   NodePort       10.47.246.183   <none>          80:31656/TCP   12m
- users-node-svc      NodePort       10.47.241.228   <none>          80:30042/TCP   14m
- gcloud compute addresses create hello-ingress-ip --global
- kubectl create -f hello-ingress-staticip.yaml


- reference
- https://kubernetes.io/docs/concepts/services-networking/ingress/


## Ingress with TLS

- openssl genrsa -out hello-ingress.key 2048
- openssl req -new -key hello-ingress.key -out hello-ingress.csr
- openssl x509 -req -days 365 -in hello-ingress.csr -signkey hello-ingress.key -out hello-ingress.crt

- reference
- https://medium.freecodecamp.org/openssl-command-cheatsheet-b441be1e8c4a

- hello-ingress-secret => secret 생성
- kubectl create secret tls hello-ingress-serect --key ./ssl_cert/hello-ingress.key --cert ./ssl_cert/hello-ingress.crt 
- => secret/hello-ingress-serect created

- kubectl create -f hello-ingress-tls.yaml

## HealthCheck
- COPY healthy /tmp/  => 내용과 상관없이 healthcheck 용
- 명령은 3가지 HTTP. TCP, Shell command

## Deployment
```
Deployment
여러가지 배포 방식을 RC를 이용해서 구현할 수 있지만, 운영이 복잡해지는 단점이 있다. 
그래서 쿠버네티스에서는 일반적으로 RC를 이용해서 배포하지 않고 
Deployment라는 개념을 사용한다. 
롤링 업데이트등을 할때, RC를 두개를 만들어야 하고, 
하나씩 Pod의 수를 수동으로 조정해야 하기 때문에 이를 자동화해서 추상화한 개념이 Deployment 이다.
```

- kubectl create -f hello-deployment.yaml
- kubectl create -f hello-deployment-service.yaml

1-1. 롤링 업데이트
- kubectl set image deployment hello-deployment hello-deployment=gcr.io/nicejames-sandbox/deployment:v2
- kubectl get pod => 롤링되는 것을 확인함

```
Replication Controller가 아니라 Replication Set (RS)을 사용함
Deployment는 RC대신 RS를 사용한다. Pod의 이름은 
[deployment 이름]-[RS의 해쉬 #]-[Pod의 해쉬#] 사용함
Pod의 이름이 hello-deployment-5756bb6c8f-* 으로, 새로 배포된 RS 의 이름과 동일
```

1-2. 객체의 설정 업데이트
- kubectl edit deploy hello-deployment
- *.yaml 파일 확인 가능 (vi로 볼수 있음) => v1 -> v2로 변경

1-3. 설정 교체 (kubectl replace)
- kubectl replace -f [YAML 파일명]
- 설정 파일 수정하거나, 설정 파일을 새로 만들어서 그 파일로 설정을 업데이트하고 싶을때는  replace 명령을 사용

1- 4. command line 으로 교체 (kubectl patch)
```
- patch 명령은 파일 업데이트 없이 기존 리소스의 설정 정보 중 여러개의 필드를 수정하고자 하는데 이용한다.
- kubectl patch [리소스 종류] [리소스명] --patch ‘[YAML이나 JSON 포맷으로 변경하고자 하는 설정]’
- ex) kubectl patch deployment hello-deployment --patch 'spec:\n template:\n spec:\n containers:\n   - name: hello-deployment\n image: gcr.io/terrycho-sandbox/deployment:v2’

- 명령은 deployment 중에 hello-deployment 리소스에 대해서 image명을  image: gcr.io/nicejames-sandbox/deployment:v2 로 변경한 예이다.
- 특히 [YAML] 설정은 한줄에 써야 하는 만큼 띄어쓰기에 조심하는 것이 좋다.
# patch나 edit의 경우 쉽게 설정을 업데이트할 수 있는 장점은 있지만, 업데이트에 대한 히스토리를 추적하기 어려운 만큼 가급적이면, 새로운 파일을 생성하고, 파일을 replace를 통해서 적용하는 것이 파일 단위로 변경 내용을 추적할 수 있기 때문에 이 방법을 권장한다.
```

2 롤백
- 배포된 버전을 체크
- kubectl rollout history deployment/hello-deployment

- 1버전으로 롤백
- kubectl rollout undo deployment hello-deployment --to-revision=1

- 가능한 docker pull gcr.io/nicejames-sandbox/deployment 를 쓸 경우
- 태그 공백은 latest 이므로 히스트리 관리를 위하며 꼭 tag (version) 를 넣어 사용한다.


## ConfigMap
1. Key-Value
- kubectl create configmap hello-cm --from-literal=language=java

2. File
- kubectl create configmap cm-file --from-file=./properties/profile.properties

3. 디스크 볼륨으로 마운트하기

## Secret
- configMap 과 유사
- 용량 1mb까지 지원
- echo java | base64 => 값은 Base64 로 인코딩
- 디코딩은 필요없음
 
 
##  모니터링
- 쿠버네티스 대시보드
- 구글클라우드 경우 권한 오류가 생겨 아래의 명령을 실행하여 어드민 권한을 부여한다.

- kubectl create clusterrolebinding cluster-admin-binding \
--clusterrole cluster-admin --user $(gcloud config get-value account)

- kubectl create -f https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/recommended/kubernetes-dashboard.yaml

# kubectl proxy
```
명령을 실행해주면 localhost:8001 포트를 통해서 쿠버네티스 클러스터로 트래픽을 프록시 해준다.
위와 같이 proxy를 실행한후에,  아래 URL로 접근을 하면, 대시보드 콘솔에 접근할 수 있다. 
```

- http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/

- https://landing.google.com/sre/books/
를 위해서 모니터링과 로깅은 어디까지나 도구일 뿐이고, 어떤 지표를 모니터링 할것인지 (SLI : Service Level Indicator), 지표의 어느값까지를 시스템 운영의 목표로 삼을 것인지 (SLO : Service Level Object)를 정하는 프렉틱스 관점이 더 중요하다.  이를 구글에서는 SRE (Site Reliability Engineering)이라고 하는데, 이에 대한 자세한 내용은 https://landing.google.com/sre/book.html 를 참고