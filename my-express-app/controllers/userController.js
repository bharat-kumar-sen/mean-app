const Users = require('../models/userModel');
const UserSkill = require('../models/skillModel')
const async = require('async');

exports.getUsers = async (req, res) => {
  try {
    var userRes = await Users.find();
    // console.log("userRes======", userRes);
    if (userRes && userRes.length) {
      return res.json({
        status: 200,
        message: 'Users fetched Successfully.',
        data: userRes
      });
    } else {
      return res.json({
        status: 500,
        message: 'No Users Found!',
        data: []
      });
    }
  } catch (error) {
    return res.json({
      status: 500,
      message: 'There are some error while getting users.',
      data: error
    })
  }
}

exports.saveUser = (req, res) => {
  let postData = req.body
  if (postData._id) {
    Users.updateOne({
      _id: postData._id
    }, postData, (userErr, userRes) => {
      if (userErr) {
        return res.json({
          status: 500,
          message: 'There are some while updating user.',
          data: userErr
        })
      } else {
        return res.json({
          status: 200,
          message: 'User has been updated successfully.'
        })
      }
    })
  } else {
    let userInfo = new Users();
    Object.keys(postData).map((objKey) => {
      userInfo[objKey] = postData[objKey];
    })
    userInfo.save((err, resp) => {
      if (err) {
        return res.json({
          status: 500,
          message: 'There are some while saving user.',
          data: err
        })
      } else {
        async.forEachSeries(postData.skills, (obj, skillCb) => {
          let userSkill = new UserSkill();
          userSkill.name = obj.name;
          userSkill.userId = resp._id;
          userSkill.save((skillError, SkillResp) => {
            skillCb()
          })
        }, (skillErr, skillRes) => {
          return res.json({
            status: 200,
            data: resp,
            message: 'User has been added successfully.'
          })
        })
      }
    })
  }
}