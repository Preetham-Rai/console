package user

type User struct {
	Name    string
	Age     int32
	IsAdmin bool
	Role    string
}

func (u *User) GetuserDetails() *User {
	return &User{
		u.Name,
		u.Age,
		u.IsAdmin,
		u.Role,
	}
}

func (u *User) ChangeUserRole(role string) bool {
	u.Role = role
	if role == "admin" {
		u.IsAdmin = true
	}
	return true
}
