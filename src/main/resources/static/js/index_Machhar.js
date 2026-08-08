var app = angular.module("loginApp", []);
            app.controller("loginController", function ($scope, $http) {
                
            
//              $scope.loadingImg = false;
            var protocal = window.location.protocol;
            var host = window.location.host;
            $scope.uRl = protocal+"//"+host+"/";
            console.log($scope.uRl);
            $scope.encryptedPassword = '';
            
            $scope.onSignUpSubmit = function ()
            {
//            $scope.loadingImg = true;
            $scope.resData = null;
            // Encrypt the password using MD5 (you should use a more secure method on the server side)
            $scope.encryptedPassword = CryptoJS.MD5($scope.userPassword).toString();                 
//            $scope.loadingImg = true;

            $scope.url = $scope.uRl + "user/getuser/" + $scope.userName;
//            alert($scope.encryptedPassword);
            $http.get($scope.url)
                    .then(function (response) {
                    $scope.resData = response.data;
                    if ($scope.resData.userName === $scope.userName) {
                    alert("Account already exist !");
                    $scope.onShowSignUpPage();
                    } else
                    {
                    if ($scope.userPasswordC === $scope.userPassword) {
                    $scope.url = $scope.uRl +"user/add/" + $scope.userName + "/"
                            + $scope.encryptedPassword + "/" + "All" + "/" 
                            + "Super User" + "/" + "Accept" + "/" + "Remark :";
                    $http.get($scope.url)
                            .then(function (response) {
                            },
                                    function (error) {
                                    console.log(error);
                                    });
                    alert("Account Succesfully Created.");
                    $scope.onShowLoginPage();
                    } else {
                    alert("Confirm Password should be match to Password.");
                    }
                    }
//                      $scope.loadingImg = false;
                    })
                    .catch(function (error) {
                        console.error("Error:", error);
                    });
            };
            
            
            
            });
