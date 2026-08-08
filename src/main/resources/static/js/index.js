 var app = angular.module("loginApp", []);
 app.controller("loginController", function ($scope, $http, $timeout) {

//              $scope.loadingImg = false;
     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.options = ["AHERI", "AKOLA", "AKOT", "AMGAON", "AMRAWATI", "ANJANGAON", "ARMORI", "ARNI", "ARVI", "ASHTI",
         "AURANGABAD", "BALARSHAH", "BADLAPUR", "BELAPUR", "BHADRAWATI", "BHANDARA", "BHIWAPUR", "BRHAMPURI", "BULDHANA", "CHAMORSHI",
         "CHANDRAPUR", "CHANDUR BAJAR", "CHANDUR RAILWAY", "CHEMBUR", "CHIKHALI", "DADAR", "DARWAH", "DARYAPUR", "DEOLI", "DEORI",
         "DEULGAON", "DHANORA", "DHARASHIV", "DIGRAS","DODDABALLAPURS", "DOMBIVALI", "GADCHIROLI", "GANDHIBAGH", "GHATANJI", "GONDIA MAIN BRANCH",
         "GONDPIPARI", "GOREGAON", "HEAD OFFICE GONDIA", "HINGANGHAT", "HINGNA", "JALGAON JAMOD", "JALNA",
         "KALAMB", "KALAMBOLI", "KALMESHWAR", "KALYAN", "KANHAN", "KARANJA GHADGE", "KARANJA LAD", "KATOL", "KHAMGAON","KOLAR","KOPARKHAIRANE", "KORCHI",
         "KUHI", "KURKHEDA", "LAKHANDUR", "LAKHANI", "LONAR", "MAHAGAON", "MALAD", "MALEGAON", "MALKAPUR", "MANGLURPIR",
         "MANISH NAGAR","MANDYA", "MANORA", "MAREGAON", "MAROL", "MAUDA", "MEHKAR","MILLERS ROAD", "MOHADI", "MORGAON ARJUNI", "MORSHI",
         "MUL", "MULCHERA", "MULUND", "MURTIJAPUR","MYSURU", "NAGBHID", "NAGPUR", "NAGPUR WEALTH", "NANDED", "NANDURA", "NARKHED",
         "NER PARSOPANT", "PANDHARKAWADA", "PARATWADA", "PARSHIVNI", "PATUR", "PAUNI", "PUSAD", "RAJURA",
         "RALEGAON", "RAMTEK", "RISOD", "SADAK ARJUNI", "SAHAYOGCHHATRAPATI", "SAKOLI", "SALEKASA",
         "SAMUDRAPUR", "SANGRAMPUR", "SAOLI", "SAONER", "SEAWOOD", "SELOO", "SHEGAON", "SINDEWAHI", "SION", "THANE", "TIRORA", "TITWALA", "TUMSAR", "ULHASNAGAR",
         "UMARKHED", "UMRED", "VASHI", "VIRAR", "WADSA", "WANI", "WARDHA", "WARUD", "WASHIM", "YAVATMAL", "ZARI JAMNI", "XYZ"];

     $scope.signUpContainerVisible = false;
     $scope.loginContainerVisible = true;
     $scope.resetContainerVisible = false;
     $scope.encryptedPassword = '';
     $scope.onShowSignUpPage = function () {
         $scope.signUpContainerVisible = true;
         $scope.loginContainerVisible = false;
         $scope.resetContainerVisible = false;
     };

     $scope.onShowLoginPage = function () {
         $scope.signUpContainerVisible = false;
         $scope.loginContainerVisible = true;
         $scope.resetContainerVisible = false;
     };

     $scope.onShowResetPage = function () {
         $scope.signUpContainerVisible = false;
         $scope.loginContainerVisible = false;
         $scope.resetContainerVisible = true;
     };

     $scope.onSignUpSubmit = function ()
     {
//            $scope.loadingImg = true;
         $scope.resData = null;
         $scope.url = $scope.uRl + "user/getuser/" + $scope.userName;
         $http.get($scope.url)
                 .then(function (response) {
                     $scope.resData = response.data;
                     if ($scope.resData.userName === $scope.userName) {
                         alert("Account already exist !");
                         $scope.onShowSignUpPage();
                     } else
                     {
                         // Encrypt the password using MD5 (you should use a more secure method on the server side)
                         $scope.encryptedPassword = CryptoJS.MD5($scope.userPassword).toString();
                         if ($scope.userPasswordC === $scope.userPassword) {
                             $scope.url = $scope.uRl + "user/add/" + $scope.userName + "/"
                                     + $scope.encryptedPassword + "/" + $scope.branchName + "/"
                                     + $scope.userType + "/" + "Pending" + "/" + "Remark :";
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

     $scope.onLoginSubmit = function ()
     {
         if ($scope.encryptedPassword === '') {

             // Encrypt the password using MD5 (you should use a more secure method on the server side)
             $scope.encryptedPassword = CryptoJS.MD5($scope.userPassword).toString();
         }
//            $scope.loadingImg = true;
         var url = $scope.uRl + "user/login/" + $scope.userName + "/" + $scope.encryptedPassword;
//            alert($scope.encryptedPassword);
         $http.get(url)
                 .then(function (response) {
                     var userRecord = response.data;
//                    alert(userRecord.userPassword);
//                    alert(userRecord.userName === $scope.userName && userRecord.userPassword === $scope.encryptedPassword);
                     if (userRecord.userName === $scope.userName && userRecord.userPassword === $scope.encryptedPassword) {

                         if (userRecord.userIdStatus === "Accept") {

                             if (userRecord.userType === "COPs") {
                                 window.location.href = $scope.uRl + "user_asCOPs.html";
                                 localStorage.setItem("user_asCOPs", JSON.stringify(userRecord));
                                 alert("Account Successfully Login.");
                             } else if (userRecord.userType === "BOM") {
                                 window.location.href = $scope.uRl + "user_asBOM.html";
                                 localStorage.setItem("user_asBOM", JSON.stringify(userRecord));
                                 alert("Account Successfully Login.");
                             } else if (userRecord.userType === "Super User") {
                                 window.location.href = $scope.uRl + "super_user.html";
                                 localStorage.setItem("super_user", JSON.stringify(userRecord));
                                 alert("Account Successfully Login.");
                             }

                         } else if (userRecord.userIdStatus === "Pending") {
                             alert("User is not Activated by Super user yet!");
                             location.reload();
                             $scope.onShowLoginPage();
                         } else if (userRecord.userIdStatus === "Reject") {
                             alert("Please, check the username & password !");
                             location.reload();
                             $scope.onShowLoginPage();
                         } else if (userRecord.userIdStatus === "Terminate") {
                             alert("Please, check the username & password !");
                             location.reload();
                             $scope.onShowLoginPage();
                         } else if (userRecord.userIdStatus === "Reset_Password") {
                             alert("User is not Activated by Super user yet!");
                             location.reload();
                             $scope.onShowLoginPage();
                         }

                     } else {
//                    alert("" === response.data);    
//                    alert(response.data);    
//                    alert(response);    
                         alert("Please, check the username & password !");
                         location.reload();
                         $scope.onShowLoginPage();
                     }
//                    $scope.loadingImg = false;

                 }, function (error) {
                     $scope.onShowLoginPage();
                     console.log(error);
//                    $scope.loadingImg = false;
                 });

         $scope.loginContainerVisible = false;
     };

     $scope.onResetSubmit = function ()
     {
         if ($scope.encryptedPassword === '') {

             // Encrypt the password using MD5 (you should use a more secure method on the server side)
             $scope.encryptedPassword = CryptoJS.MD5($scope.userPassword).toString();
         }
//            $scope.loadingImg = true;
         if ($scope.userPasswordC === $scope.userPassword) {
             var url = $scope.uRl + "user/reset/" + $scope.userName + "/" + $scope.encryptedPassword;
             $http.get(url)
                     .then(function (response) {
                         var userRecord = response.data;
                         if (!(userRecord)) {

                             alert("Please, check the username");

                         } else {
                             alert("Password Updated");
                             location.reload();
                             $scope.onShowLoginPage();
                         }
//                   $scope.loadingImg = false;
                     }, function (error) {
                         $scope.onShowLoginPage();
                         console.log(error);
//                    $scope.loadingImg = false;
                     });
             $scope.loginContainerVisible = false;
         } else {
             alert("Confirm Password should be match to Password.");
         }
     };

 });
