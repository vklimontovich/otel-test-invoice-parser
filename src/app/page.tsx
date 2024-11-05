"use client";

import { useState } from "react";
import { Button, message, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

const HomePage = () => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [invoiceData, setInvoiceData] = useState<any>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const props = {
    name: "file",
    multiple: false,
    fileList,
    onRemove: (file: any) => {
      setFileList([]);
    },
    beforeUpload: (file: any) => {
      setFileList([file]);
      return false; // Prevent automatic upload
    },
    onChange(info: any) {
      const { status } = info.file;
      if (status !== "uploading") {
        // Do nothing for now
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const handleProcess = async () => {
    if (fileList.length === 0) {
      alert("Please upload a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileList[0]);

    setLoading(true);

    try {
      const response = await fetch("/proc", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Failed to process invoice. Status: ${response.status}`);
      }
      setInvoiceData(await response.json());
    } catch (error) {
      alert("An error occurred while processing the invoice. See console");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Dragger {...props} className="w-full">
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ color: "#1890ff", fontSize: "48px" }} />
        </p>
        <p className="ant-upload-text text-lg font-medium">Add invoice file</p>
        <p className="ant-upload-hint">Click or drag file to this area to upload</p>
      </Dragger>
      <div className="flex justify-center my-4">
        <Button type="primary" onClick={handleProcess} loading={loading} size="large" className="mt-4">
          Process
        </Button>
      </div>
      {invoiceData && (
        <div className="mt-8 font-mono bg-neutral-900 text-neutral-100 text-sm px-6 py-4 rounded-xl ">
          <pre>{JSON.stringify(invoiceData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default HomePage;
