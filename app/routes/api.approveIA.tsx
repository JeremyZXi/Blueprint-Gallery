import { supabase } from "../utils/supabase";

export const action = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { id, password } = await request.json();

    if (!id) {
      return Response.json({ error: "Missing IA id" }, { status: 400 });
    }

    const expectedPassword = process.env.VITE_ADMIN_PASSWORD;

    if (!expectedPassword || password !== expectedPassword) {
      return Response.json({ error: "Invalid admin password" }, { status: 401 });
    }

    // Update the submission status to approved testtest test test
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to approve submission: ${error.message}`);
    }

    return Response.json({ success: true, message: "IA approved successfully" });
  } catch (error: unknown) {
    console.error("Error approving IA:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: "Failed to approve IA", details: errorMessage }, { status: 500 });
  }
}; 