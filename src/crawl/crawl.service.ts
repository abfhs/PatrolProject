import { BadGatewayException, Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig, Method } from 'axios';
import * as fakeUa from 'fake-useragent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';

@Injectable()
export class CrawlService {
  private hostUrl: string;
  private cookieString: string;

  async findAddress(address: string) {

    /**
     * 로그인 계정 선택
     */
    var id = process.env.SITE_ID;


    this.hostUrl = 'https://www.iros.go.kr';

    const userAgent = fakeUa();

    var headers: any = {
      "Host": "www.iros.go.kr",
      "User-Agent": userAgent,
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

    bodyJson = {"websquare_param":{"user_id": id,"mbr_pw": process.env.SITE_PASSWORD,"general_login_yn":"Y","user_id_g": id,"mbr_pw_g": process.env.SITE_PASSWORD}}
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
    resultData = await this.fetchData('post', url, headers, bodyJson);

    var totalRecordCount = resultData.paginationInfo.totalRecordCount;
    if(totalRecordCount > 100){
      throw new BadGatewayException('검색결과가 너무 많습니다') 
    }

    var addressList = []
    interface addressItem {
      real_indi_cont_detail: string,
      pin: string
    }

    var totalPageCount: number = resultData.paginationInfo.totalPageCount;
    for (var page = 0; page < totalPageCount; page++) {
      bodyJson = {
        "websquare_param": {
          "search_kwd": address,
          "real_cls": "",
          "sido_gb": "",
          "use_cls": "",
          "pageIndex": page+1,
          "pageUnitProperty": "pr10.common.pagenation.pageUnit.10",
          "pageSizeProperty": "pr10.common.pagenation.pageSize.10"
        }
      }
      url = '/biz/Pr10AwrtApplRealInputCtrl/retrieveSmplSrch.do?CRYPTED_ID__=' + crypted_id + '&USER_ID__=' + id + '&IS_NMBR_LOGIN__=null';
      resultData = await this.fetchData('post', url, headers, bodyJson);
      try {
        var dlt_smpl_srch_list = resultData.dlt_smpl_srch_list;
        for (var idx = 0; idx < dlt_smpl_srch_list.length; idx++) {
          var addressJson: addressItem = {
            real_indi_cont_detail: '',
            pin: '',

          };
          addressJson.real_indi_cont_detail = dlt_smpl_srch_list[idx].real_indi_cont_detail.replace(/<[^>]*>/g, '');
          addressJson.pin = dlt_smpl_srch_list[idx].pin;

          addressList.push(addressJson);
        }
      } catch (e) {
        console.log(e);
      }


    }

    var cookieString: string = this.cookieString;

    return { 
      addressList,
      crypted_id,
      id,
      cookieString,
    };
  }

  async findProcess(
    real_indi_cont_detail: string,
    crypted_id: string,
    id: string,
    cookieString: string,
    pin: string
  ){

    this.hostUrl = 'https://www.iros.go.kr';

    const userAgent = fakeUa();
    this.cookieString = cookieString;

    var headers: any = {
      "Host": "www.iros.go.kr",
      "User-Agent": userAgent,
      "Accept": "application/json",
      "Accept-Language": "ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Referer": "https://www.iros.go.kr/index.jsp",
      "Content-Type": "application/json; charset=\"UTF-8\"",
      "submissionid": "mf_wfm_potal_main_wfm_content_sbm_Pr10SprtApplCsprCsInqCtrl_retrieveRealAdrno",
      "Origin": "https://www.iros.go.kr",
      "Connection": "keep-alive",
      "Priority": "u=0"
    }

    var bodyJson : any;

    bodyJson ={
      "websquare_param": {
        "pin": pin,
        "addrCls": 3,
        "real_indi_cont": real_indi_cont_detail,
        "real_cls": "",
        "search_cls": ""
      }
    }
    var url =  this.hostUrl + "/biz/Pr10SprtApplCsprCsInqCtrl/retrieveRealAdrno.do?CRYPTED_ID__=" + crypted_id + "&USER_ID__=" + id + "&IS_NMBR_LOGIN__=null&IS_NMBR_LOGIN__=null&IS_NMBR_LOGIN__=null&IS_NMBR_LOGIN__=null&IS_NMBR_LOGIN__=null";
    var resultData = await this.fetchData('post', url, headers, bodyJson);
    if(resultData.result != 'SUCC'){
      throw new BadGatewayException('인터넷등기소 사이트 변경, 확인필요') 
    }

    return resultData.realOwnrInfoList[0];

  }

  async checkProcess(
    real_indi_cont_detail: string,
    crypted_id: string,
    id: string,
    cookieString: string,
    pin: string,
    name: string
  ){
    this.hostUrl = 'https://www.iros.go.kr';

    const userAgent = fakeUa();
    this.cookieString = cookieString;

    var headers: any = {
      "Host": "www.iros.go.kr",
      "User-Agent": userAgent,
      "Accept": "application/json",
      "Accept-Language": "ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Referer": "https://www.iros.go.kr/index.jsp",
      "Content-Type": "application/json; charset=\"UTF-8\"",
      "submissionid": "mf_wfm_potal_main_wfm_content_sbm_Pr10SprtApplCsprCsInqCtrl_retrieveRealAdrno",
      "Origin": "https://www.iros.go.kr",
      "Connection": "keep-alive",
      "Priority": "u=0"
    }

    var bodyJson : any;

    bodyJson = {
    "websquare_param": {
      "addrCls": 3,
      "a103Name": name,
      "nameType": "2",
      "a105pin": pin,
      "regt_no": "",
      "regt_ver": "",
      "search_cls": "109",
      "pass": ""
    },
    "smplData": {
      "pin": pin,
      "addrCls": 3,
      "real_indi_cont": real_indi_cont_detail,
      "real_cls": "",
      "search_cls": "109"
    },
    "addrData": {
      "selKindCls": "",
      "real_cls": "",
      "admin_regn1": "",
      "admin_regn2": "",
      "admin_regn3": "",
      "lot_no": "",
      "buld_name": "",
      "buld_no_buld": "",
      "buld_no_room": "",
      "rd_name": "",
      "rd_buld_no": "",
      "txt_addr_cls": "",
      "close_cls": "",
      "search_cls": "",
      "admin_regn1_cd": ""
    }
  }
    headers.submissionid = 'mf_wfm_potal_main_wfm_content_sbm_Pr10SprtApplCsprCsInqCtrl_retrieveApplCsprCsList';
    var url =  this.hostUrl + "/biz/Pr10SprtApplCsprCsInqCtrl/retrieveApplCsprCsList.do?CRYPTED_ID__=" + crypted_id + "&USER_ID__=" + id + "&IS_NMBR_LOGIN__=null&IS_NMBR_LOGIN__=null";
    var resultData = await this.fetchData('post', url, headers, bodyJson);
    
    if(resultData.result != 'SUCC'){
      throw new BadGatewayException('인터넷등기소 사이트 변경, 확인필요') 
    }

    const response = resultData.applCsprCsList[0];

    return response;
  }

  /**
   * 스케줄러 전용 로그인 세션 확보함수
   * @returns crypted_id, cookieString
   */
  async getLogin(){

    var id = process.env.SITE_ID;


    this.hostUrl = 'https://www.iros.go.kr';

    const userAgent = fakeUa();

    var headers: any = {
      "Host": "www.iros.go.kr",
      "User-Agent": userAgent,
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

    bodyJson = {"websquare_param":{"user_id": id,"mbr_pw": process.env.SITE_PASSWORD,"general_login_yn":"Y","user_id_g": id,"mbr_pw_g": process.env.SITE_PASSWORD}}
    var url =  this.hostUrl + "/biz/Pm10P0LoginMngCtrl/handleMbrLogin.do?IS_NMBR_LOGIN__=null?IS_NMBR_LOGIN__=null?IS_NMBR_LOGIN__=null";
    var resultData = await this.fetchData('post', url, headers, bodyJson);

    if( 
      resultData.user_id != id ||
      !resultData.crypted_id
    ){
      throw new BadGatewayException('로그인 오류, 등기소 확인필요.')          
    }

    const unixTimestamp: number = Math.floor(Date.now() / 1000);

    var cookieString = '; userId=' + id + '; popupIdOTP-CM-001=OTP-CM-001; lastAccess=' + unixTimestamp + '000; '

    var crypted_id = resultData.crypted_id;

    return {id, crypted_id, cookieString}
  }

  /**
   * 스케줄러 전용 조회함수
   * @returns {등기조회결과}
   */
  async getChuriData(
    id: string,
    crypted_id: string,
    cookieString: string,
    addressPin: string,
    ownerName: string,
    address: string,
  ){
    this.hostUrl = 'https://www.iros.go.kr';

    const userAgent = fakeUa();
    this.cookieString = cookieString;

    var headers: any = {
      "Host": "www.iros.go.kr",
      "User-Agent": userAgent,
      "Accept": "application/json",
      "Accept-Language": "ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Referer": "https://www.iros.go.kr/index.jsp",
      "Content-Type": "application/json; charset=\"UTF-8\"",
      "submissionid": "mf_wfm_potal_main_wfm_content_sbm_Pr10SprtApplCsprCsInqCtrl_retrieveRealAdrno",
      "Origin": "https://www.iros.go.kr",
      "Connection": "keep-alive",
      "Priority": "u=0"
    }

    var bodyJson : any;

    bodyJson ={
      "websquare_param": {
        "pin": addressPin,
        "addrCls": 3,
        "real_indi_cont": address,
        "real_cls": "",
        "search_cls": ""
      }
    }
    var url =  this.hostUrl + "/biz/Pr10SprtApplCsprCsInqCtrl/retrieveRealAdrno.do?CRYPTED_ID__=" + crypted_id + "&USER_ID__=" + id + "&IS_NMBR_LOGIN__=null&IS_NMBR_LOGIN__=null&IS_NMBR_LOGIN__=null&IS_NMBR_LOGIN__=null&IS_NMBR_LOGIN__=null";
    var resultData = await this.fetchData('post', url, headers, bodyJson);
    if(resultData.result != 'SUCC'){
      throw new BadGatewayException('인터넷등기소 사이트 변경, 확인필요') 
    }

    bodyJson = {
    "websquare_param": {
      "addrCls": 3,
      "a103Name": ownerName,
      "nameType": "2",
      "a105pin": addressPin,
      "regt_no": "",
      "regt_ver": "",
      "search_cls": "109",
      "pass": ""
    },
    "smplData": {
      "pin": addressPin,
      "addrCls": 3,
      "real_indi_cont": address,
      "real_cls": "",
      "search_cls": "109"
    },
    "addrData": {
      "selKindCls": "",
      "real_cls": "",
      "admin_regn1": "",
      "admin_regn2": "",
      "admin_regn3": "",
      "lot_no": "",
      "buld_name": "",
      "buld_no_buld": "",
      "buld_no_room": "",
      "rd_name": "",
      "rd_buld_no": "",
      "txt_addr_cls": "",
      "close_cls": "",
      "search_cls": "",
      "admin_regn1_cd": ""
    }
  }
    headers.submissionid = 'mf_wfm_potal_main_wfm_content_sbm_Pr10SprtApplCsprCsInqCtrl_retrieveApplCsprCsList';
    var url =  this.hostUrl + "/biz/Pr10SprtApplCsprCsInqCtrl/retrieveApplCsprCsList.do?CRYPTED_ID__=" + crypted_id + "&USER_ID__=" + id + "&IS_NMBR_LOGIN__=null&IS_NMBR_LOGIN__=null";
    var resultData = await this.fetchData('post', url, headers, bodyJson);
    
    if(resultData.result != 'SUCC'){
      throw new BadGatewayException('인터넷등기소 사이트 변경, 확인필요') 
    }

    const response = resultData.applCsprCsList[0];

    return response;
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
      const proxyUrl = process.env.PROXY_URL;
      const httpsAgent = new HttpsProxyAgent(proxyUrl);
      const httpAgent = new HttpProxyAgent(proxyUrl);
      
      // SSL 인증서 검증 비활성화를 위한 설정
      process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

      const requestConfig: AxiosRequestConfig = {
        method,
        url,
        headers,
        data,
        maxRedirects: 5, // Disable automatic redirects to prevent loops
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Accept status codes in the 2xx and 3xx ranges
        },
        httpsAgent,
        httpAgent,
        proxy: false // Disable axios built-in proxy to use agents instead
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