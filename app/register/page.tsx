export default function registerPage() {
  return (
    <div>
      <h1>Register</h1>
      <form>
        <div>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input type="password" id="confirmPassword" name="confirmPassword" />
        </div>
        <div>
          <label htmlFor="role">Role:</label>
          <input type="text" id="role" name="role" />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
