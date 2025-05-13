import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";

import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
} from "examples/Navbars/DashboardNavbar/styles";

import { useMaterialUIController, setTransparentNavbar } from "context";

// Firebase import
import { signOut } from "firebase/auth";
import { auth } from "firebaseConfig";
import { useNavigate } from "react-router-dom";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { fixedNavbar, darkMode, transparentNavbar } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const route = useLocation().pathname.split("/").slice(1);

  const navigate = useNavigate();

  useEffect(() => {
    setNavbarType(fixedNavbar ? "sticky" : "static");

    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  const renderMenu = () => (
    <Menu anchorEl={openMenu} open={Boolean(openMenu)} onClose={handleCloseMenu} sx={{ mt: 2 }}>
      <NotificationItem icon={<Icon>email</Icon>} title="Check new messages" />
      <NotificationItem icon={<Icon>podcasts</Icon>} title="Manage Podcast sessions" />
      <NotificationItem icon={<Icon>shopping_cart</Icon>} title="Payment completed" />
    </Menu>
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/authentication/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;
      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }
      return colorValue;
    },
  });

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
        </MDBox>
        <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
          <Link to="/authentication/sign-in/basic">
            <IconButton sx={navbarIconButton} size="small" disableRipple>
              <Icon sx={iconsStyle}>account_circle</Icon>
            </IconButton>
          </Link>
          <IconButton
            size="small"
            disableRipple
            color="inherit"
            sx={navbarIconButton}
            onClick={handleOpenMenu}
          >
            <Icon sx={iconsStyle}>notifications</Icon>
          </IconButton>
          {renderMenu()}
          {/* Logout Button */}
          <IconButton
            size="small"
            disableRipple
            color="inherit"
            sx={navbarIconButton}
            onClick={handleLogout}
          >
            <Icon sx={iconsStyle}>logout</Icon>
          </IconButton>
        </MDBox>
      </Toolbar>
    </AppBar>
  );
}

DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
