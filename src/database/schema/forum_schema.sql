-- Forum Reactions Table
CREATE TABLE IF NOT EXISTS forum_reactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  thread_id INT NULL,
  post_id INT NULL,
  reaction_type ENUM('like', 'dislike') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
  -- Ensure a user can only have one reaction per thread or post
  CONSTRAINT unique_thread_reaction UNIQUE (user_id, thread_id),
  CONSTRAINT unique_post_reaction UNIQUE (user_id, post_id),
  -- Ensure either thread_id or post_id is set, but not both
  CONSTRAINT check_reaction_target CHECK (
    (thread_id IS NULL AND post_id IS NOT NULL) OR 
    (thread_id IS NOT NULL AND post_id IS NULL)
  )
);

-- Indexes for better performance
CREATE INDEX idx_forum_reactions_thread ON forum_reactions(thread_id);
CREATE INDEX idx_forum_reactions_post ON forum_reactions(post_id);
CREATE INDEX idx_forum_reactions_user ON forum_reactions(user_id);
