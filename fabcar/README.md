# fabcar 예제 실행방법 및 설명

## 1. Network 실행

다음 쉘스크립트 실행:

- ./startFabric.sh (startnetwork.sh, createchannel.sh, setAnchorPeerUpdate.sh, deployCC.sh 쉘스크립트가 순차적으로 실행됨)

## 2. application 예제 실행

총 3가지 형태의 application 예제가 존재하며 Network 실행 이후 각 예제 폴더 내에서 application 구동함. 모든예제는 동일한 [fabcar chaincode](chaincode)를 사용함

|  **Example** | **Description** |
| -----------|------------------------------|
| [application-javascript-static](application-javascript-static) | 네트워크 구동시 생성된 인증서를 활용하는 fabcar 어플리케이션 |
| [application-javascript](application-javascript-static) | CA를 활용하여 동적으로 인증서를 생성하여 사용하는 fabcar 어플리케이션 |
| [application-web](application-javascript-static) | 웹어플리케이션 형식으로 구동되는 fabcar 어플리케이션 |

