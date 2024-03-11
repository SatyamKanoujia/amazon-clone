import 'dart:convert';

import 'package:amazone_clone/constant/error_handling.dart';
import 'package:amazone_clone/constant/global_variable.dart';
import 'package:amazone_clone/constant/utils.dart';
import 'package:amazone_clone/models/product.dart';
import 'package:amazone_clone/models/user.dart';
import 'package:amazone_clone/provider/user_provider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;

class CartServices {
  void removeFromCart({
    required BuildContext context,
    required Product product,
  }) async {
    final userProvider = Provider.of<UserProvider>(context, listen: false);

    try {
      http.Response res = await http.delete(
        Uri.parse('$uri/api/remove-from-cart/${product.id}'),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'x-auth-token': userProvider.user.token,
        },
      );

      // ignore: use_build_context_synchronously
      httpErrorHandle(
        response: res,
        context: context,
        onSuccess: () {
          User user =
              userProvider.user.copyWith(cart: jsonDecode(res.body)['cart']);
          userProvider.setUserFromModel(user);
        },
      );
    } catch (e) {
      // ignore: use_build_context_synchronously
      showSnackBar(context, e.toString());
    }
  }
}
