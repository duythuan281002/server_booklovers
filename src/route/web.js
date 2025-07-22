import express from "express";
import homeController from "../controllers/homeController";
import bookController from "../controllers/bookController";
import userController from "../controllers/userController";
import blogController from "../controllers/blogController";
import contactController from "../controllers/contactController";
import authController from "../controllers/authController";
import upload from "../middleware/uploadMiddleware";
import authMiddleware from "../middleware/authMiddleware";
import cartController from "../controllers/cartController";
import promotionController from "../controllers/promotionController";
import orderController from "../controllers/orderController";
import categoryController from "../controllers/categoryController";
import vnpayController from "../controllers/vnpayController";
import passport from "passport";

const router = express.Router();

const initWebRoutes = (app) => {
  router.get("/", homeController.getHomePage);

  router.get("/api/books", bookController.getAllBooks);
  router.get("/api/book/:id", bookController.getBookById);
  router.post("/api/book", bookController.createBook);
  router.put("/api/book/:id", bookController.updateBook);
  router.delete("/api/book/:id", bookController.deleteBook);
  router.get("/api/menu", categoryController.getCategoriesWithSub);

  router.get("/api/users", userController.getAllUsers);
  router.get("/api/user/profile", authMiddleware, userController.getProfile);
  router.get("/api/user/:id", userController.getUserById);
  router.post("/api/user", upload.single("avatar"), userController.createUser);
  router.put(
    "/api/user",
    authMiddleware,
    upload.single("avatar"),
    userController.updateUser
  );
  router.put(
    "/api/user/update-password",
    authMiddleware,
    userController.updatePassword
  );
  router.delete("/api/user/:id", userController.deleteUser);
  router.post("/api/user/loginuser", userController.loginUser);
  router.post("/api/user/google-login", authController.googleLogin);
  router.post(
    "/api/user/facebook-login",
    authController.facebookLoginController
  );
  router.post("/api/user/loginadmin", userController.loginAdmin);
  router.post(
    "/api/user/address",
    authMiddleware,
    userController.createAddress
  );
  router.put(
    "/api/user/address/up",
    authMiddleware,
    userController.updateAddress
  );
  router.put(
    "/api/user/address/set-default",
    authMiddleware,
    userController.setDefaultAddress
  );
  router.delete(
    "/api/user/address/:id",
    authMiddleware,
    userController.deleteAddress
  );

  router.get("/api/blogs", blogController.getAllBlogsPage);
  router.get("/api/blog/:id", blogController.getBlogById);
  router.post("/api/blog", upload.single("image"), blogController.createBlog);
  router.get("/api/blogs/featured", blogController.getFeaturedBlogs);
  router.put(
    "/api/blog/:id",
    upload.single("image"),
    blogController.updateBlog
  );
  router.delete("/api/blog/:id", blogController.deleteBlog);

  router.post("/api/contact", contactController.createContact);
  router.get("/api/contacts", contactController.getAllContacts);

  router.post("/forgot-password", authController.sendResetOTP);
  router.post("/verify-otp", authController.verifyOTP);
  router.post("/reset-password", authController.resetPassword);

  router.post(
    "/email-change/send-otp",
    authMiddleware,
    authController.sendCurrentEmailOTP
  );
  router.post(
    "/email-change/verify-otp",
    authMiddleware,
    authController.verifyCurrentEmailOTP
  );
  router.post(
    "/email-change/update",
    authMiddleware,
    authController.updateToNewEmail
  );

  router.post("/send-otp-phone", authController.sendOtpPhone);
  router.post("/verify-otp-phone", authController.verifyOtpPhone);

  router.get("/api/cart", authMiddleware, cartController.getCartByUser);
  router.post("/api/cart/add", authMiddleware, cartController.addItemToCart);
  router.put(
    "/api/cart/item/:itemId",
    authMiddleware,
    cartController.updateItemQuantity
  );
  router.delete(
    "/api/cart/item/:itemId",
    authMiddleware,
    cartController.removeItemFromCart
  );

  router.post("/api/promotion/apply", promotionController.applyPromotion);

  router.post("/api/orders", authMiddleware, orderController.createOrder);
  router.get(
    "/api/orders/my-orders",
    authMiddleware,
    orderController.getUserOrders
  );
  router.put(
    "/api/orders/:orderId/cancel",
    authMiddleware,
    orderController.cancelOrder
  );

  router.post("/api/vnpay/create_payment_url", vnpayController.createPayment);
  router.get("/api/vnpay/vnpay_return", vnpayController.vnpayReturn);

  app.use("/", router);
};

export default initWebRoutes;
