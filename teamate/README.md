# Teamate 예제 실행방법 및 순서

## 1. Network 실행

network 경로에서 (다음 쉘스크립트 순차 실행):

- ./startnetwork.sh
- ./createchannel.sh
- ./setAnchorPeerUpdate.sh
- ./deployCC.sh

## 2. CCP 생성

application/ccp 경로에서 (다음 쉘스크립트 실행):

- ./ccp-generate.sh

## 3. 인증서 가져오기 및 지갑 생성

application 경로에서 (다음 쉘스크립트 순차 실행):

- ./getCert.sh
- ./addToWallet.js

## 4. node.js 모듈 설치

application 경로에서

- npm install

## 5. invoke/query 실행 또는 서버 실행

application 경로에서

- node query.js : readRating 실행
- node invoke.js : readRating and addRating 실행
- node server.js : teamate 어플리케이션 웹서버 실행
