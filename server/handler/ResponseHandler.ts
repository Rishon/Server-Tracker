export default class ResponseHandler {
  static INVALID_ROUTE = { message: "Invalid route", status: 404 };
  static INVALID_METHOD = { message: "Invalid method", status: 405 };
  static INVALID_BODY = { message: "Invalid body", status: 400 };
  static INTERNAL_ERROR = { message: "Internal server error", status: 500 };
  static CORS_HEADERS = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  };

  static invalidResponse(error: { message: string; status: number }) {
    return new Response(JSON.stringify({ success: false, error }), {
      status: error.status,
      headers: {
        "content-type": "application/json",
        ...ResponseHandler.CORS_HEADERS.headers,
      },
    });
  }

  static successResponse(data: any) {
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        "content-type": "application/json",
        ...ResponseHandler.CORS_HEADERS.headers,
      },
    });
  }

  static redirectResponse(url: string) {
    return new Response(null, {
      status: 302,
      headers: {
        location: url,
        ...ResponseHandler.CORS_HEADERS.headers,
      },
    });
  }
}
