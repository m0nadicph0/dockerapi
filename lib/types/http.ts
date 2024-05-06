export interface HttpHeader {
  [key: string]: string;
}

export interface HttpRequest {
  method: string;
  path: string;
  headers: HttpHeader;
  body: string;
  query: URLSearchParams;
}

export interface HttpResponse {
  status: number;
  body: string;
  headers: HttpHeader;
}
