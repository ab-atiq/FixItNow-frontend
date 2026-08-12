import { NextRequest, NextResponse } from "next/server";

function resolveBackendApiBase() {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://ph-l2-a4-fix-it-now-backend-project-drab.vercel.app/api";
  const normalized = raw.replace(/\/+$/, "");

  return normalized.endsWith("/api") ? normalized : normalized + "/api";
}

async function handle(request: NextRequest, path: string[]) {
  const apiBase = resolveBackendApiBase();
  const joinedPath = path.join("/");
  const url = new URL(apiBase + "/" + joinedPath);

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  const headers = new Headers();
  const auth = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");

  if (auth) headers.set("authorization", auth);
  if (contentType) headers.set("content-type", contentType);

  const method = request.method;
  const hasBody = !["GET", "HEAD"].includes(method);

  const upstream = await fetch(url.toString(), {
    method,
    headers,
    body: hasBody ? await request.text() : undefined,
    cache: "no-store",
  });

  const responseText = await upstream.text();
  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type");

  if (upstreamType) {
    responseHeaders.set("content-type", upstreamType);
  }

  return new NextResponse(responseText, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handle(request, path || []);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handle(request, path || []);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handle(request, path || []);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handle(request, path || []);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handle(request, path || []);
}
