export const response = {
  error: (error: string, status = 400) =>
    new Response(JSON.stringify({ error }), { status }),
  success: (data?: any, status = 200, ...other: any) =>
    new Response(JSON.stringify({ data, ...other }), { status }),
};

