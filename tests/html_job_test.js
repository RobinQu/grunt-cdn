/*global describe, it */

var expect = require('chai').expect,
    cheerio = require('cheerio'),
    url = require('url'),
    sinon = require('sinon'),
    HTMLJob = require('../tasks/lib/html_job'),
    _ = require('underscore'),
    Snippets = require("./fixtures");


describe('HTML Job', function() {
  var globalConfig = {
    cdn: 'http://my.site.com/'
  };

  
  describe('entry event', function() {
    it('should emit every time we found a replacable tag', function(done) {
      var job = new HTMLJob(globalConfig),
          callback = sinon.spy();
      job.start(Snippets.str3).on('entry', callback);
      setTimeout(function() {
        expect(callback.callCount).to.equal(2);
        done();
      }, 50);
    });
    
    it('should contain original and replaced url', function() {
      var job = new HTMLJob(globalConfig);
      job.start(Snippets.image1).on('entry', function(data) {
        expect(data.before).to.equal(cheerio.load(Snippets.image1)('img').attr('src'));
        expect(data.after).to.equal(url.resolve(globalConfig.cdn, "pic.png"));
      });
    });
    
    describe('# Replacement cases', function() {
      it('should replace content with data-* attributes', function(done) {
        var job = new HTMLJob(globalConfig),
            callback = sinon.spy();
        
        job.start(Snippets.str4).on('entry', callback);
        setTimeout(function() {
          var data, 
              $before = cheerio.load(Snippets.str4);
          expect(callback.calledOnce).to.be.true;
          data = callback.firstCall.args[0];
          expect(data.before).to.equal($before('div').data('placeholder'));
          expect(data.after).to.equal(url.resolve(globalConfig.cdn, "b.png"));
          done();
        }, 50);
      });
    });
    
  });
  
  describe('end event', function() {
    it('should contain the result string', function(done) {
      var job = new HTMLJob(globalConfig);
    
      job.start(Snippets.image1).on('end', function(result) {
        expect(result).to.be.ok;
        var $ = cheerio.load(result);
        expect($('img').attr('src')).to.equal(url.resolve(globalConfig.cdn, 'pic.png'));
        done();
      });
      
    });
  });
  
  describe('ignore event', function() {
    it('should contain ignored url and reason', function(done) {
      var job = new HTMLJob(_.extend(globalConfig, { ignorePath: /\.(gif)$/ })),
          callback = sinon.spy();
      job.start(Snippets.str2).on('ignore', callback);
      setTimeout(function() {
        var i, len;
        expect(callback.calledTwice).to.be.true;
        for(i=0,len=callback.callCount; i<len; i++) {
          expect(callback.getCall(i).args[0].resource).to.be.ok;
          expect(callback.getCall(i).args[0].reason).to.be.ok;
        }
        done();
      }, 40);
    });
    
    //TODO: test other cases to ignore
  });
  
  
});