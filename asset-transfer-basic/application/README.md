# 예제 실행방법 및 순서

## 1. Network 실행

application 경로에서

- ./startATB.sh

## 2. CCP 생성

application/ccp 경로에서 (다음 쉘스크립트 실행):

- ./ccp-generate.sh

## 3. node.js 모듈 설치

application 경로에서

- npm install

## 4. 인증서 가져오기 및 지갑 생성

application 경로에서 (다음 쉘스크립트 순차 실행):

- ./enrollAdmin.js
- ./registerUser.js


## 5. 서버 실행

application 경로에서

- node server.js : 어플리케이션 웹서버 실행
