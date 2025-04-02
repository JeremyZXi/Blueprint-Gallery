import { useState } from "react";
import { testEmailConfig } from "../utils/email";

export const TestEmail = () => {
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleTestEmail = async () => {
    try {
      setSending(true);
      console.log("Sending test email...");
      const result = await testEmailConfig();
      console.log("Test email result:", result);
      setResponse(result);
      alert("Test email sent! Check the console for details.");
    } catch (error) {
      console.error("Error sending test email:", error);
      alert(`Error sending test email: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Test Email Configuration</h2>
      <button
        onClick={handleTestEmail}
        disabled={sending}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
      >
        {sending ? "Sending..." : "Send Test Email"}
      </button>
      {response && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p><strong>Response:</strong> {response.success ? "Success" : "Failed"}</p>
          {response.result && <p><strong>Message ID:</strong> {response.result.messageId}</p>}
          {response.error && <p className="text-red-500"><strong>Error:</strong> {response.error.message}</p>}
        </div>
      )}
    </div>
  );
}; 