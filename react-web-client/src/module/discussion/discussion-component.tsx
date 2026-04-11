import { Button, Form, Input, Layout, Modal } from "antd";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { discussionSchema, type discussionType } from "./services/schema";
import { zodResolver } from "@hookform/resolvers/zod";

const { TextArea } = Input;

function DiscussionComponent() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<discussionType>({
    resolver: zodResolver(discussionSchema),
  });
  const [modalActive, setModalActive] = useState<boolean>(false);

  const handleCancel = () => {
    setModalActive(false);
  };

  const handleClose = () => {
    setModalActive(false);
  };

  const onSubmit = (data: any) => {
    console.log(data);
    handleClose();
  };
  return (
    <Layout
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        padding: "var(--space-2)",
      }}
    >
      <div>
        <Button
          type="primary"
          onClick={() => {
            setModalActive(true);
          }}
        >
          Create
        </Button>
      </div>

      <Modal
        title="Create Discussion"
        closable={{ "aria-label": "Custom Close Button" }}
        open={modalActive}
        onOk={handleClose}
        onCancel={handleCancel}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            validateStatus={errors.subject ? "error" : ""}
            help={errors.subject?.message}
          >
            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <Input {...field} type="text" placeholder="Add a Subject" />
              )}
            />
          </Form.Item>
          <Form.Item
            validateStatus={errors.description ? "error" : ""}
            help={errors.description?.message}
          >
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  rows={4}
                  placeholder="Enter descriptions"
                  // maxLength={6}
                />
              )}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" block htmlType="submit" shape="default">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default DiscussionComponent;
