import React, { Component } from 'react';

import { PasswordForgetForm } from '../PasswordForget';
import PasswordChangeForm from '../PasswordChange';

import {AuthUserContext ,withAuthorization} from '../Session';
import {withFirebase} from '../Firebase'



const SocialLoginToggle = ({onlyOneLeft,isEnabled,signInMethod,onLink,onUnlink}) =>  isEnabled ? (
    <button disabled={onlyOneLeft} className="button" type="button" onClick={() => onUnlink(signInMethod.id)}>
        Deactivate {signInMethod.id}
    </button>
    ) : (
    <button className="button" type="button" onClick={() => onLink(signInMethod.provider)}>
        Link {signInMethod.id}
    </button>
)
class DefaultLoginToggle extends Component {
    constructor(props) {
        super(props)
        this.state = {passwordOne: '', passwordTwo: ''}
    }
    onSubmit = event => {
        event.preventDefault()
        this.props.onLink(this.state.passwordOne)
        this.setState({passwordOne: '', passwordTwo: ''})
    }
    onChange = event => {
        this.setState({[event.target.name] : event.target.value})
    }
    render () {
        const {onlyOneLeft,isEnabled,signInMethod, onUnlink} = this.props
        const {passwordOne, passwordTwo} = this.state
        const isInvalid = passwordOne !== passwordTwo || passwordOne === ''
        return isEnabled ? (
            <button disabled={onlyOneLeft} className="button" type="button" onClick={() => onUnlink(signInMethod.id)}>
                Deactivate {signInMethod.id}
            </button>
            ) : (
            <form onSubmit={this.onSubmit}>
                <input 
                    name="passwordOne"
                    value={passwordOne}
                    onChange={this.onChange}
                    type="password"
                    placeholder="New password"
                />
                <input 
                    name="passwordTwo"
                    value={passwordTwo}
                    onChange={this.onChange}
                    type="password"
                    placeholder="Confirm new password"
                />
                <button disabled={isInvalid} className="button" type="submit">
                    Link {signInMethod.id}
                </button>
            </form>
        )
        
    }
}

class LoginManagmentBase extends Component {
    constructor(props) {
        super(props)

        this.state = {
            activeSignInMethods: [],
            error: null,
        }
    }
    
    componentDidMount() {
        this.fetchSignInMethods()
    }
    fetchSignInMethods = () => {
        const {firebase, authUser} = this.props
        firebase.auth.fetchSignInMethodsForEmail(authUser.email)
        .then(activeSignInMethods => this.setState({activeSignInMethods, error: null}))
        .catch(error => this.setState({error}))
    }
    onSocialLoginLink = provider => {
        const {firebase} = this.props
        firebase.auth.currentUser
        .linkWithPopup(firebase[provider])
        .then(this.fetchSignInMethods)
        .catch(error => this.setState({error}))
    }
    onUnlink = providerId => {
        const {firebase} = this.props
        firebase.auth.currentUser
        .unlink(providerId)
        .then(this.fetchSignInMethods)
        .catch(error => this.setState({error}))
    }
    onDefaultLoginLink = (password) => {
        const {firebase, authUser} = this.props
        console.log(authUser)
        const credential = firebase.emailAuthProvider.credential(
            authUser.email, password
        )
        firebase.auth.currentUser
        .linkAndRetrieveDataWithCredential(credential)
        .then(this.fetchSignInMethods)
        .catch(error => this.setState({error}))
    }
    render () { 
        const {activeSignInMethods, error} = this.state
        return (
            <div>
                Sign In Methods:
                <ul>
                    {SIGN_IN_METHODS.map(signInMethod => {
                        const onlyOneLeft = activeSignInMethods.length === 1
                        const isEnabled = activeSignInMethods.includes(signInMethod.id,)
                        return (
                            <li key={signInMethod.id}>
                                {   
                                    signInMethod.id === 'password' ? (
                                        <DefaultLoginToggle 
                                            onlyOneLeft={onlyOneLeft}
                                            isEnabled={isEnabled}
                                            signInMethod={signInMethod}
                                            onLink={this.onDefaultLoginLink}
                                            onUnlink={this.onUnlink}
                                        />
                                    ) : (
                                        <SocialLoginToggle 
                                            onlyOneLeft={onlyOneLeft}
                                            isEnabled={isEnabled}
                                            signInMethod={signInMethod}
                                            onLink={this.onSocialLoginLink}
                                            onUnlink={this.onUnlink}
                                        />
                                    )
                                }
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
        
    }
}
const SIGN_IN_METHODS = [
    {
        id: 'password',
        provider: null
    },
    {
        id: 'google.com',
        provider: 'googleProvider'
    },
    {
        id: 'facebook.com',
        provider: 'facebookProvider'
    },
    {
        id: 'twitter.com',
        provider: 'twitterProvider'
    }
]

const AccountPage = () => (
    <AuthUserContext.Consumer>
        {authUser => (
            <div>
                <h1>Account: {authUser.email}</h1>
                <PasswordForgetForm />
                <PasswordChangeForm />
                <LoginManagment authUser={authUser} />
            </div>
        )} 
     </AuthUserContext.Consumer>
);
const LoginManagment = withFirebase(LoginManagmentBase)
const condition = authUser => !!authUser;
export default withAuthorization(condition)(AccountPage);