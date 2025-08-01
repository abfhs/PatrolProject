// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  nickname: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// Crawl types
export interface FindAddressRequest {
  address: string;
}

export interface AddressItem {
  real_indi_cont_detail: string;
  pin: string;
}

export interface FindAddressResponse {
  addressList: AddressItem[];
  crypted_id?: string;
  id?: string;
  cookieString?: string;
}

export interface FindProcessRequest {
  real_indi_cont_detail: string;
  crypted_id: string;
  id: string;
  cookieString: string;
  pin: string;
}

export interface ProcessResult {
  a301pin?: string;
  a318nomprs_name?: string;
  a301use_cls_cd_nm?: string;
}

export interface CheckProcessRequest {
  real_indi_cont_detail: string;
  crypted_id: string;
  id: string;
  cookieString: string;
  pin: string;
  name: string;
}

export interface CheckProcessResponse {
  a101rel_charge_cd?: string;      // 담당계
  a101recev_date?: string;         // 접수일자
  regt_name?: string;              // 접수등기소
  e033rgs_sel_name?: string;       // 등기목적
  a101recev_no?: string;           // 접수번호
  recev_regt_name?: string;        // 처리등기소
  a105real_indi_cont?: string;     // 부동산 소재지번
  a105_pin?: string;               // 주소번호
  a101recev_regt_ver?: string;
  a101appl_year?: string;
  a101handl_stat_cd?: string;
  itpurcode?: number;
  a101bond_no?: string;
  juris_regt_nm?: string;
  a101regt_no?: string;
  strHistDateTime?: string;
  al03_suv_rog?: string;
  a101bond_return_fee?: number;
  statlin?: string;
  strRegiPrintGb?: string;
  a101regt_ver?: string;
  sub_court_name?: string;
  court_name?: string;
  recev_court_name?: string;
  a101recev_seq?: number;
  e008cd_name?: string;
  a101recev_regt_no?: string;
  a101bond_no_fee?: number;
  a101recv_gb?: string;
  a101appl_cls_cd?: string;
  a131enr_no_cls_cd_cnt?: number;
}

// Generic API response
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}