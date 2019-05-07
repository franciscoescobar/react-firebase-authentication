import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import { withFirebase } from '../Firebase'
import * as ROUTES from '../../constants/routes'
import * as ROLES from '../../constants/roles'

const SignUpPage = () => (
  <div>
    <h1>SignUp</h1>
    <SignUpForm/>}
   
  </div>
)

const INITIAL_STATE = {
    username: '',
    email: '',
    passwordOne: '',
    passwordTwo: '',
    isAdmin: false,
    error: null,
}

const ERROR_CODE_ACCOUNT_EXISTS = 'auth/email-already-in-use'
const ERROR_MSG_ACCOUNT_EXISTS = 'An account with this E-mail address already exists. Try to login from this account instead. If you think the account is already used from one of the social logins, try to sign-in with one of them. Afterward, associate your accounts on your personal account page.'


class SignUpFormBase extends Component {
  constructor(props) {
    super(props)
    this.state = {...INITIAL_STATE}
  }
  onChangeCheckBox = event => {
    this.setState({[event.target.name] : event.target.checked})
  }
  onSubmit = event => {
    const { username, email, passwordOne, isAdmin } = this.state;
    const roles = {}
    if (isAdmin) {
      roles[ROLES.ADMIN] = ROLES.ADMIN
    }
    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {
        // Create a user in your Firebase realtime database
        return this.props.firebase
          .user(authUser.user.uid)
          .set({
            username,
            email,
            roles,
          });
      })
      .then( () => {
        return this.props.firebase.doSendEmailVerification()
      })
      .then( () => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        if(error.code === ERROR_CODE_ACCOUNT_EXISTS) {
          error.message = ERROR_MSG_ACCOUNT_EXISTS
        }
        this.setState({ error });
      });

    event.preventDefault();
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  render() {
    const {
        username,
        email,
        passwordOne,
        passwordTwo,
        isAdmin,
        error,
      } = this.state

    const isInvalid = passwordOne !== passwordTwo || passwordOne === '' || email === '' || username === ''

    return (
      <form onSubmit={this.onSubmit}>
        <div className="field">
            <p className="control has-icons-left has-icons-right">
              <input
                name="username"
                value={username}
                onChange={this.onChange}
                type="text"
                placeholder="Full Name"
                className="input"
                />
              <span className="icon is-small is-left">
                <i className="fas fa-user"></i>
              </span>
            </p>
          </div>

        <div className="field">
          <p className="control has-icons-left has-icons-right">
            <input
              name="email"
              value={email}
              onChange={this.onChange}
              type="text"
              placeholder="Email Address"
              className="input"
            />
            <span className="icon is-small is-left">
              <i className="fas fa-envelope"></i>
            </span>
            <span className="icon is-small is-right">
              <i className="fas fa-check"></i>
            </span>
          </p>
        </div>
        
        
        <div className="field">
          <p className="control has-icons-left has-icons-right">
            <input
            name="passwordOne"
            value={passwordOne}
            onChange={this.onChange}
            type="password"
            placeholder="Password"
            className="input"
            />
            <span className="icon is-small is-left">
                <i className="fas fa-lock"></i>
            </span>
            </p>
          </div>
          <div className="field">
          <p className="control has-icons-left has-icons-right">
            <input
              name="passwordTwo"
              value={passwordTwo}
              onChange={this.onChange}
              type="password"
              placeholder="Confirm Password"
              className="input"
            />
        
            <span className="icon is-small is-left">
              <i className="fas fa-lock"></i>
            </span>
          </p>
        </div>
        <label>
          Admin:
          <input 
            name="isAdmin"
            type="checkbox"
            checked={isAdmin}
            onChange={this.onChangeCheckBox}
          />
        </label>
        <button type="submit" disabled={isInvalid} className="button">Sign Up</button>
      </form>
    )
  }
}

const SignUpForm = compose(withRouter,withFirebase)(SignUpFormBase)

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
)

export default SignUpPage

export { SignUpForm, SignUpLink }