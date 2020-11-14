import React from "react";

import AuthUserContext from "./context";
import { withFirebase } from "../Firebase";
import { Centered } from "../../styles/global";

const withAuthorization = (condition) => (Component) => {
  class WithAuthorization extends React.Component {
    _initFirebase = false;

    savePathname = () =>
      window.localStorage.setItem(
        "pathname",
        this.props.location.pathname.replace(this.props.pathPrefix, "")
      );

    firebaseInit = () => {
      if (this.props.firebase && !this._initFirebase) {
        this._initFirebase = true;

        this.listener = this.props.firebase.onAuthUserListener(
          (authUser) => {
            if (!authUser) {
              console.log("no auth user found")
              this.savePathname();
              window.location.href = "/login";
            }
          },
          () => {
              console.log("authorization fallback")
            this.savePathname();
            window.location.href = "/login";
          }
        );
      }
    };

    componentDidMount() {
      this.firebaseInit();
    }

    componentDidUpdate() {
      this.firebaseInit();
    }

    componentWillUnmount() {
      this.listener && this.listener();
    }

    render() {
	  const NoAuthorization = () => (
	    <Centered>
          <h3>You don't have permission to view this page!</h3>
		  <p>If you believe you should have access, please contact an admin.</p>
        </Centered>
	  );
		
      return (
        <AuthUserContext.Consumer>
          {(authUser) =>
            condition(authUser) ? <Component {...this.props} /> : <NoAuthorization />
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return withFirebase(WithAuthorization);
};

export default withAuthorization;