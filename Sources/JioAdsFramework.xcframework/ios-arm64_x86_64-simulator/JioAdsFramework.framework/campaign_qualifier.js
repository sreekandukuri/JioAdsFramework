
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TargettingValidator = function () {
    function TargettingValidator() {
        _classCallCheck(this, TargettingValidator);

        this.customKeys = {};
        this.isNativePlatform = false;
        this.setPlatformIdentifier();
        console.log('Jio TargettingValidator - \'v1.1.0\'');
    }

    _createClass(TargettingValidator, [{
        key: 'setPlatformIdentifier',
        value: function setPlatformIdentifier() {
            this.isNativePlatform = (typeof tvjsInterface === 'undefined' ? 'undefined' : _typeof(tvjsInterface)) == 'object' ? true : false;
        }
    }, {
        key: 'isTargetingMatched',
        value: function isTargetingMatched(targeting) {
            var customKeyValExpression = targeting;
            if (customKeyValExpression) {
                var retVal = this.checkCustomKVTargetting(customKeyValExpression);
                console.info('%c Targeting - EXP_VALUE => ' + retVal, 'background: #222; color: #FF0');
                return retVal;
            } else return true;
        }
    }, {
        key: 'checkCustomKVTargetting',
        value: function checkCustomKVTargetting(str_exp) {
            var regex = /mdt\('(.*?)',\s*'(.*?)',\s*'(.*?)\'\)/gm;
            var m = void 0;
            var that = this;
            var finalList = [];
            while ((m = regex.exec(str_exp)) !== null) {
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
                m.result = that.executeCustomKVExpression(m[1].trim(), m[2].trim(), m[3].trim());
                finalList.push(m);
            }
            for (var i = 0; i < finalList.length; i++) {
                let key = finalList[i][0];
                let val = finalList[i]["result"];
                str_exp = str_exp.replace(key, val);
            }
            str_exp = str_exp.replace(/and/g, "&&");
            str_exp = str_exp.replace(/or/g, "||");
            console.log("checkCustomKVTargetting before eval:"+str_exp);
            return this.booleanStringCompiler(str_exp);
        }
    }, {
      key: 'booleanStringCompiler',
      value: function booleanStringCompiler(str) {
            str = str.trim();
            str = str.split(" ");
            var result = str[0] == "true" ? true : false;
            for (var i = 1; i < str.length;) {
              if (str[i] == "&&") {
                let cstr = (str[i + 1] == "true") ? true : false;
                result = result && cstr;
                i = i+2;
              } else if (str[i] == "||") {
                let cstr = (str[i + 1] == "true") ? true : false;
                result = result || cstr;
                i = i+2;
              } else i = i+1;
            }
            return result;
      }
    }, {
        key: 'isKVPresentInList',
        value: function isKVPresentInList(arrListVal, arrCustomKeyVal) {
            var modifiers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "i";

            for (var val in arrListVal) {
                console.log('isKVPresentInList => ', arrCustomKeyVal.toUpperCase(), arrListVal[val]);
                arrCustomKeyVal = arrCustomKeyVal.split(',').map(function (v) {
                    return v.trim();
                }).join('|');
                if (new RegExp('^' + arrCustomKeyVal.toUpperCase() + '$', 'i').test(arrListVal[val].trim())) {
                    console.log('isKVPresentInList => Returns: TRUE');
                    return true;
                }
            }
            console.log('isKVPresentInList => Returns: FALSE');
            return false;
        }
    }, {
        key: 'executeCustomKVExpression',
        value: function executeCustomKVExpression(key, _val, _opr) {
            try {
                var exclude_test_for_keys = ['pcat', 'scat'];
                if (exclude_test_for_keys.includes(key)) {
                    console.log('Evaluted to TRUE as key: ' + key + ' found!');
                    return true;
                }
                _val = _val.split(',').map(function (_val) {
                    return _val.toUpperCase();
                });
                var no_conditions = Object.keys(this.customKeys).length;
                var _ctr = 0;
                var one_of_condition_is_invalid = false;
                if (no_conditions) {
                    for (var i in this.customKeys) {
                        if (new RegExp('^' + i + '$', 'i').test(key)) {

                            if (_opr == '!=' && !this.isKVPresentInList(_val, this.customKeys[i]) || _opr == '==' && this.isKVPresentInList(_val, this.customKeys[i])) {
                                return true;
                            } else {
                                one_of_condition_is_invalid = true;
                            }
                        } else {
                            if (_opr == '!=') {
                                _ctr++;
                            } else {
                                one_of_condition_is_invalid = true;
                            }
                        }
                    }
                } else {
                    if (_opr == '!=') {
                        return true;
                    }
                }
                return !one_of_condition_is_invalid && _ctr > 0;
            } catch (err) {
                console.debug(err);
                return false;
            }
        }
    }, {
        key: 'getTargettedAds',
        value: function getTargettedAds(customKeyValueExpressionList, customKeyValues) {
            try {
                let that = this;
                this.customKeys = _extends({}, customKeyValues);
                const filtered_array = [];
                customKeyValueExpressionList.forEach(element => {
                    if(that.isTargetingMatched(element['serverExp'])) {
                        filtered_array.push(element['adId']);
                    }
                });
                console.log(`Final Result ${filtered_array}`);
                console.log(filtered_array);
              //  if (this.isNativePlatform) this.onMatchTargettedAds(filtered_array);else return [];
                return filtered_array
            }catch(error) {
                console.log('something went wrong', error);
               // if (this.isNativePlatform) this.onMatchTargetingExpression([]);
              //  else return [];
                return [];
            }
        }
    }, {
        key: 'onMatchTargettedAds',
        value: function onMatchTargettedAds(args) {
            try {
                console.log('Dispatch in onMatchTargettedAds: VAL => ' + args);
                tvjsInterface.onMatchTargettedAds(args);
            } catch (err) {
                console.log('Caught in onMatchTargettedAds: VAL => ' + args + ', Error: ' + err);
            }
        }
    }, {
        key: 'isTargetingExpressionMatch',
        value: function isTargetingExpressionMatch(customKeyValueExpression, customKeyValues) {
            try {
                this.customKeys = _extends({}, customKeyValues);
                var retVal = true;
                retVal = this.isTargetingMatched(customKeyValueExpression);
                if (this.isNativePlatform) this.onMatchTargetingExpression(retVal);else return retVal;
            } catch (error) {
                console.log('something went wrong', error);
                if (this.isNativePlatform) this.onMatchTargetingExpression(false);
                else return false;
            }
        }
    }, {
        key: 'onMatchTargetingExpression',
        value: function onMatchTargetingExpression(args) {
            try {
                console.log('Dispatch in onMatchTargetingExpression: VAL => ' + args);
                tvjsInterface.onMatchTargetingExpression(args);
            } catch (err) {
                console.log('Caught in onMatchTargetingExpression: VAL => ' + args + ', Error: ' + err);
            }
        }
    }]);

    return TargettingValidator;
}();

var cq = new TargettingValidator();
