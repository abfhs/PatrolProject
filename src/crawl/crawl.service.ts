import { BadGatewayException, Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig, Method } from 'axios';
import * as fakeUa from 'fake-useragent';

@Injectable()
export class CrawlService {
  private hostUrl: string;
  private cookieString: string;

  async churiProcess(address: string, name: string) {

    /**
     * 로그인 계정 선택
     */
    var id = 'abfhs64';


    this.hostUrl = 'https://www.iros.go.kr';

    const userAgent = fakeUa();

    var headers: any = {
      "Host": "www.iros.go.kr",
      // "User-Agent": userAgent,
      "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0',
      "Accept": "application/json",
      "Accept-Language": "ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Referer": "https://www.iros.go.kr/index.jsp",
      "Content-Type": "application/json; charset=\"UTF-8\"",
      "submissionid": "mf_wfm_potal_main_wfm_content_sbm_Pm10P0LoginMngCtrl_handleMbrLogin",
      "Origin": "https://www.iros.go.kr",
      "Connection": "keep-alive",
      "Priority": "u=0"
    }

    var bodyJson : any;

    bodyJson = {"websquare_param":{"user_id": id,"mbr_pw":"joonzero1!","general_login_yn":"Y","user_id_g": id,"mbr_pw_g":"joonzero1!"}}
    var url =  this.hostUrl + "/biz/Pm10P0LoginMngCtrl/handleMbrLogin.do?IS_NMBR_LOGIN__=null?IS_NMBR_LOGIN__=null?IS_NMBR_LOGIN__=null";
    var resultData = await this.fetchData('post', url, headers, bodyJson);

    if( 
      resultData.user_id != id ||
      !resultData.crypted_id
    ){
      throw new BadGatewayException('로그인 오류, 등기소 확인필요.')          
    }

    const unixTimestamp: number = Math.floor(Date.now() / 1000);

    this.cookieString += '; userId=' + id + '; popupIdOTP-CM-001=OTP-CM-001; lastAccess=' + unixTimestamp + '000; '

    var crypted_id = resultData.crypted_id;

    // 주소검색
    address = '서울특별시관악구남부순환로1990-3'

    
    headers.submissionid = 'mf_wfm_potal_main_wfm_content_popup' + unixTimestamp + '_wframe_sbm_Pr10AwrtApplRealInputCtrl_retrieveSmplSrch'
    bodyJson = {
      "websquare_param": {
        "search_kwd": address,
        "real_cls": "",
        "sido_gb": "",
        "use_cls": "",
        "pageIndex": 1,
        "pageUnitProperty": "pr10.common.pagenation.pageUnit.10",
        "pageSizeProperty": "pr10.common.pagenation.pageSize.10"
      }
    }
    url = '/biz/Pr10AwrtApplRealInputCtrl/retrieveSmplSrch.do?CRYPTED_ID__=' + crypted_id + '&USER_ID__=' + id + '&IS_NMBR_LOGIN__=null';
    var resultData = await this.fetchData('post', url, headers, bodyJson);

    // var totalRecordCount = resultData.paginationInfo.totalRecordCount;
    // if(totalRecordCount > 100){
    //   throw new BadGatewayException('검색결과가 너무 많습니다') 
    // }

    // var totalRecordCount = 33;

    // bodyJson = {
    //   "websquare_param": {
    //     "search_kwd": address,
    //     "real_cls": "",
    //     "sido_gb": "",
    //     "use_cls": "",
    //     "pageIndex": 1,
    //     "pageUnitProperty": "pr10.common.pagenation.pageUnit." + totalRecordCount,
    //     "pageSizeProperty": "pr10.common.pagenation.pageSize.10"
    //   }
    // }
    // var resultData = await this.fetchData('post', url, headers, bodyJson);



    return { address, name }
  }

  async fetchData(
    /**
     * HTTP 요청 메서드
     * @example 'get', 'post', 'put', 'delete'
     */
    method: Method,
    /**
     * 요청을 보낼 URL
     * @example 'https://www.example.com'
     */
    url: string,
    /**
     * 요청 헤더 (선택 사항)
     * @example { 'Authorization': 'Bearer your-token' }
     */
    headers?: any,
    /**
     * 요청 본문 (선택 사항, 주로 POST, PUT 요청에 사용)
     * @example { key: 'value' }
     */
    data?: any,
  ): Promise<any> {
    try {
      if(url.indexOf('https:') == -1){
        url = this.hostUrl + url;
      }
      // const userAgent = fakeUa();
      const requestConfig: AxiosRequestConfig = {
        method,
        url,
        headers,
        // headers: {
        //   'User-Agent': userAgent,
        //   ...headers,
        // },
        data,
        maxRedirects: 5, // Allow up to 5 redirects
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Accept status codes in the 2xx and 3xx ranges
        },
      };

      if (this.cookieString) {
        requestConfig.headers['Cookie'] = this.cookieString;
      }

      console.log('Request:', {
        method: requestConfig.method,
        url: requestConfig.url,
        headers: requestConfig.headers,
        body: requestConfig.data,
      });

      const response = await axios(requestConfig);

      if (response.headers['set-cookie']) {
        const newCookies: string[] = response.headers['set-cookie'];
        const cookieMap = new Map<string, string>();

        if (this.cookieString) {
          const existingCookies = this.cookieString.split('; ');
          existingCookies.forEach(cookie => {
            const parts = cookie.split('=');
            const key = parts.shift()?.trim();
            if (key) {
              cookieMap.set(key, cookie);
            }
          });
        }

        newCookies.forEach(cookieStr => {
          const firstPart = cookieStr.split(';')[0];
          const parts = firstPart.split('=');
          const key = parts.shift()?.trim();
          if (key) {
            cookieMap.set(key, firstPart);
          }
        });

        this.cookieString = Array.from(cookieMap.values()).join('; ');
        console.log('Updated cookieString:', this.cookieString);
      }


      console.log('Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  }
}