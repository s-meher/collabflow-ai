import { Layout } from "../components/Layout";
import { useDocumentRealtime } from "../hooks/useDocumentRealtime";

const HARDCODED_DOCUMENT_ID = "cmi5ddbpo0002xyb3hzivsaiu";
const HARDCODED_USER_ID = "cmi58ezzx0000xy4wtegdujlg";

export function DocumentPage() {
  const { content, updateContent, isConnected } = useDocumentRealtime(
    HARDCODED_DOCUMENT_ID,
    HARDCODED_USER_ID
  );

  return (
    <Layout title="Document">
      <div className="space-y-4">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
            isConnected
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isConnected ? "Connected" : "Disconnected"}
        </span>

        <textarea
          className="w-full h-[70vh] bg-slate-900 text-slate-100 rounded-lg p-4 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          value={content}
          onChange={(event) => updateContent(event.target.value)}
          placeholder="Start typing your document..."
        />
      </div>
    </Layout>
  );
}

export default DocumentPage;
