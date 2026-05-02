import { Form, Input, Layout, Button } from "antd";
import type { UserRegistration } from "./types/user.types";
import { useRegistration } from "./services/auth-api";
import { Controller, useForm } from "react-hook-form";

const { Content } = Layout;

function RegistrationComponent() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UserRegistration>({});
  const { mutate: registerUser } = useRegistration();

  const onSubmit = (data: UserRegistration) => {
    debugger;
    registerUser(data);
  };

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 14 },
    },
  };

  return (
    <>
      <Content className="registration-content">
        <Form
          onFinish={handleSubmit(onSubmit)}
          layout="horizontal"
          className="registration-form"
          {...formItemLayout}
          // style={{ maxWidth: 600 }}
        >
          <Form.Item label="Name" required help={errors.name?.message}>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item label="Email" required help={errors.email?.message}>
            <Controller
              name="email"
              control={control}
              rules={{ required: "Email is required" }}
              render={({ field }) => <Input type="email" {...field} />}
            />
          </Form.Item>

          <Form.Item label="Username" required help={errors.username?.message}>
            <Controller
              name="username"
              control={control}
              rules={{ required: "Username is required" }}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item label="Password" required help={errors.password?.message}>
            <Controller
              name="password"
              control={control}
              rules={{ required: "Password is required" }}
              render={({ field }) => <Input.Password {...field} />}
            />
          </Form.Item>

          <Form.Item label="Bio">
            <Controller
              name="bio"
              control={control}
              render={({ field }) => <Input.TextArea rows={3} {...field} />}
            />
          </Form.Item>

          <Form.Item label="Location">
            <Controller
              name="location"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Register
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </>
  );
}

export default RegistrationComponent;
