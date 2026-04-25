import { Form, Input, Layout, Select, Switch, Button } from "antd";
import { useForm, Controller } from "react-hook-form";
import type { UserRegistration } from "./types/user.types";
import { useRegistration } from "./services/registration-api";

const { Content } = Layout;

function RegistrationComponent() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UserRegistration>({
    defaultValues: {
      isActive: true,
      preferences: { theme: "light", notifications: true },
    },
  });
  const { mutate: registerUser } = useRegistration();

  const onSubmit = (data: UserRegistration) => {
    registerUser(data);
  };

  return (
    <>
      <Content className="registration-content">
        <Form
          onFinish={handleSubmit(onSubmit)}
          layout="vertical"
          className="registration-form"
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

          <Form.Item label="Username">
            <Controller
              name="username"
              control={control}
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

          <Form.Item label="Role" required help={errors.role?.message}>
            <Controller
              name="role"
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field }) => (
                <Select {...field}>
                  <Select.Option value="admin">Admin</Select.Option>
                  <Select.Option value="user">User</Select.Option>
                  <Select.Option value="moderator">Moderator</Select.Option>
                </Select>
              )}
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

          <Form.Item label="Theme">
            <Controller
              name="preferences.theme"
              control={control}
              render={({ field }) => (
                <Select {...field}>
                  <Select.Option value="light">Light</Select.Option>
                  <Select.Option value="dark">Dark</Select.Option>
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item label="Notifications">
            <Controller
              name="preferences.notifications"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )}
            />
          </Form.Item>

          <Form.Item label="Active">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )}
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
