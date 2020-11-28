import React from 'react';
import getUsers from '../services/user.service'

let axios = require('axios');

let user
let user_id

const MONGO_EXPRESS_API = process.env.REACT_APP_MONGO_USERS || ''

const logout = () => {
  axios.put(MONGO_EXPRESS_API, {"function":"logout"})
  document.location.reload()
}

const deleteAccount = () => {
  let ans = window.confirm("Are you sure?")
  if(ans){
    axios.delete(MONGO_EXPRESS_API, { "data": {"id":user_id}})
    document.location.reload()
  }
}
  
const changePassword = () => {
  let newPassword = document.getElementById('newP').value
  axios.put(MONGO_EXPRESS_API, {
    "function":"changePassword",
    "id": user_id,
    "newPassword": newPassword
  })
  document.location.reload()
  window.alert('Password changes successfully!')
}

class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      changepw: false,
      disabled: false,
      users: []
    }
  }

  componentDidMount() {
    getUsers()
      .then(res => this.setState({ users: res }))
      .catch(err => console.log(err));
  }

  render() {

    this.state.users.forEach(function(el){
      if (el.signedIn === true){
        user_id = el.id
        user = el.username
      }
    })

    return (
      <div>
        {user ? 
          <>
            <table className="table">
              <tbody>
                <tr>
                  <td>
                    <button disabled={this.state.disabled} className="nav-link" onClick={()=>this.setState({changepw: true, disabled: true})}>Change Password</button>
                  </td>
                  <td>
                    <button disabled={this.state.disabled} className="nav-link" onClick={deleteAccount}>Delete Account</button>
                  </td>
                  <td>
                    <button disabled={this.state.disabled} className="nav-link" onClick={logout}>Logout</button>
                  </td>
                </tr>
              </tbody>  
            </table>
            {this.state.changepw ? 
              <form onSubmit={changePassword}>
                <input id="newP" type="password" placeholder="New Password" autofocus/>
                <input type="submit" value="Confirm"/>
              </form>
            :
              ''
            }
          </> 
        : 
          <a href={'/login'}>Login</a>
        }
      </div>
    );
  }
}

export default Account;